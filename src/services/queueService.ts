import { soraService } from './soraService';
import { useQueueStore } from '@/stores/queueStore';
import { createVideoThumbnail, getMovementPresetPrompt } from '@/lib/utils';
import { ApiError } from '@/lib/apiError';
import type { QueuedJob, SavedGeneration } from '@/types/sora';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 5000; // 5 seconds
const RATE_LIMIT_RETRY_DELAY = 60000; // 60 seconds for 429 errors

export class QueueService {
  private onJobComplete: (generation: SavedGeneration) => void;
  private onToast: (message: string, type: 'success' | 'error' | 'info') => void;

  constructor(
    onJobComplete: (generation: SavedGeneration) => void,
    onToast: (message: string, type: 'success' | 'error' | 'info') => void
  ) {
    this.onJobComplete = onJobComplete;
    this.onToast = onToast;
  }

  async processJob(job: QueuedJob): Promise<void> {
    const { updateJob, stopProcessing, removeJob } = useQueueStore.getState();

    try {
      // Build full prompt
      const movementPrompt = getMovementPresetPrompt(job.settings.movementPreset);
      const fullPrompt = movementPrompt ? `${job.prompt} ${movementPrompt}` : job.prompt;

      // Generate video
      const { job: completedJob, videoBlob, generationId } = await soraService.generateVideo(
        {
          prompt: fullPrompt,
          width: job.settings.width,
          height: job.settings.height,
          n_seconds: job.settings.duration,
          n_variants: job.settings.nVariants,
          model: 'sora',
        },
        job.mediaFile,
        (status) => {
          const progressMap: Record<string, number> = {
            queued: 10,
            preprocessing: 25,
            running: 50,
            processing: 75,
            succeeded: 100,
          };
          updateJob(job.id, {
            status: status as any,
            progress: progressMap[status] || 0,
          });
        }
      );

      // Create thumbnail
      const videoUrl = URL.createObjectURL(videoBlob);
      const thumbnailUrl = await createVideoThumbnail(videoUrl);

      // Create saved generation
      const savedGeneration: SavedGeneration = {
        id: completedJob.id,
        generationId,
        prompt: job.prompt,
        videoUrl,
        thumbnailUrl,
        timestamp: Date.now(),
        expiresAt: completedJob.expires_at ? completedJob.expires_at * 1000 : null,
        settings: job.settings,
        mode: job.mode,
      };

      // Mark as completed
      updateJob(job.id, { status: 'succeeded', progress: 100 });
      this.onJobComplete(savedGeneration);
      this.onToast(`Video "${job.prompt.slice(0, 30)}..." generated successfully!`, 'success');

      // Remove from queue after delay
      setTimeout(() => {
        removeJob(job.id);
      }, 3000);
    } catch (error) {
      console.error(`Job ${job.id} failed (attempt ${job.retryCount + 1}):`, error);
      this.handleJobError(job, error);
    } finally {
      stopProcessing(job.id);
    }
  }

  private handleJobError(job: QueuedJob, error: unknown): void {
    const { updateJob } = useQueueStore.getState();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if this is a rate limit error (429)
    const isRateLimitError =
      (error instanceof ApiError && error.status === 429) ||
      errorMessage.includes('Too many running tasks') ||
      errorMessage.includes('429');

    // Calculate retry delay with exponential backoff
    const retryDelay = isRateLimitError
      ? RATE_LIMIT_RETRY_DELAY
      : BASE_RETRY_DELAY * Math.pow(2, job.retryCount);

    const now = Date.now();
    const nextRetryAt = now + retryDelay;

    // Check if we should retry
    if (job.retryCount < MAX_RETRIES) {
      updateJob(job.id, {
        status: 'queued',
        progress: 0,
        error: `${errorMessage} (retry ${job.retryCount + 1}/${MAX_RETRIES} in ${Math.round(retryDelay / 1000)}s)`,
        retryCount: job.retryCount + 1,
        lastRetryAt: now,
        nextRetryAt: nextRetryAt,
      });

      if (isRateLimitError) {
        this.onToast(`Rate limited. Retrying "${job.prompt.slice(0, 30)}..." in ${Math.round(retryDelay / 1000)}s`, 'info');
      } else {
        this.onToast(`Retrying "${job.prompt.slice(0, 30)}..." in ${Math.round(retryDelay / 1000)}s`, 'info');
      }
    } else {
      // Max retries exceeded
      updateJob(job.id, {
        status: 'failed',
        error: `${errorMessage} (max retries exceeded)`,
      });
      this.onToast(`Failed to generate "${job.prompt.slice(0, 30)}..." after ${MAX_RETRIES} attempts`, 'error');
    }
  }

  async resumeJob(job: QueuedJob): Promise<void> {
    const { updateJob, stopProcessing, removeJob } = useQueueStore.getState();

    try {
      // Check current status on server
      const serverJob = await soraService.getJobStatus(job.id);

      if (serverJob.status === 'succeeded') {
        // Job completed while we were away
        if (serverJob.generations.length === 0) {
          throw new Error('No generations found in completed job');
        }

        const generationId = serverJob.generations[0].id;
        const videoBlob = await soraService.downloadVideo(generationId);
        const videoUrl = URL.createObjectURL(videoBlob);
        const thumbnailUrl = await createVideoThumbnail(videoUrl);

        const savedGeneration: SavedGeneration = {
          id: serverJob.id,
          generationId,
          prompt: job.prompt,
          videoUrl,
          thumbnailUrl,
          timestamp: Date.now(),
          expiresAt: serverJob.expires_at ? serverJob.expires_at * 1000 : null,
          settings: job.settings,
          mode: job.mode,
        };

        updateJob(job.id, { status: 'succeeded', progress: 100 });
        this.onJobComplete(savedGeneration);
        this.onToast(`Video "${job.prompt.slice(0, 30)}..." completed!`, 'success');

        setTimeout(() => {
          removeJob(job.id);
        }, 3000);
      } else if (serverJob.status === 'failed' || serverJob.status === 'cancelled') {
        updateJob(job.id, {
          status: serverJob.status,
          error: serverJob.failure_reason || 'Job failed',
        });
        this.onToast(`Job "${job.prompt.slice(0, 30)}..." failed`, 'error');
      } else {
        // Job still in progress, continue polling
        const completedJob = await soraService.pollJobStatus(job.id, (status) => {
          const progressMap: Record<string, number> = {
            queued: 10,
            preprocessing: 25,
            running: 50,
            processing: 75,
            succeeded: 100,
          };
          updateJob(job.id, {
            status: status as any,
            progress: progressMap[status] || job.progress,
          });
        });

        // Download video
        if (completedJob.generations.length === 0) {
          throw new Error('No generations found in completed job');
        }

        const generationId = completedJob.generations[0].id;
        const videoBlob = await soraService.downloadVideo(generationId);
        const videoUrl = URL.createObjectURL(videoBlob);
        const thumbnailUrl = await createVideoThumbnail(videoUrl);

        const savedGeneration: SavedGeneration = {
          id: completedJob.id,
          generationId,
          prompt: job.prompt,
          videoUrl,
          thumbnailUrl,
          timestamp: Date.now(),
          expiresAt: completedJob.expires_at ? completedJob.expires_at * 1000 : null,
          settings: job.settings,
          mode: job.mode,
        };

        updateJob(job.id, { status: 'succeeded', progress: 100 });
        this.onJobComplete(savedGeneration);
        this.onToast(`Video "${job.prompt.slice(0, 30)}..." generated successfully!`, 'success');

        setTimeout(() => {
          removeJob(job.id);
        }, 3000);
      }
    } catch (error) {
      console.error(`Failed to resume job ${job.id}:`, error);

      // Check if this is a 404 (job doesn't exist on server anymore)
      if (error instanceof ApiError && error.status === 404) {
        console.log(`Job ${job.id} not found on server, removing from queue`);
        removeJob(job.id);
        this.onToast(`Job "${job.prompt.slice(0, 30)}..." no longer exists on server (removed)`, 'info');
        return;
      }

      // Other errors - mark as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateJob(job.id, {
        status: 'failed',
        error: errorMessage,
      });
      this.onToast(`Failed to resume "${job.prompt.slice(0, 30)}...": ${errorMessage}`, 'error');
    } finally {
      stopProcessing(job.id);
    }
  }
}
