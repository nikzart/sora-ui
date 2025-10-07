import { useEffect, useRef, useCallback } from 'react';
import { useQueueStore } from '@/stores/queueStore';
import { QueueService } from '@/services/queueService';
import { saveQueueToStorage, loadQueueFromStorage } from '@/lib/queueStorage';
import type { SavedGeneration, GenerationSettings, GenerationMode, MediaFile, QueuedJob } from '@/types/sora';

const MAX_CONCURRENT_JOBS = 3;
const MAX_RESUME_AGE = 24 * 60 * 60 * 1000; // 24 hours

interface UseQueueOptions {
  onJobComplete: (generation: SavedGeneration) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useQueue({ onJobComplete, onToast }: UseQueueOptions) {
  const queueService = useRef<QueueService | null>(null);
  const isInitialized = useRef(false);
  const processingInterval = useRef<number | null>(null);

  const {
    jobs,
    addJob,
    updateJob,
    removeJob,
    clearCompleted,
    startProcessing,
    getJobsToProcess,
  } = useQueueStore();

  // Initialize service
  if (!queueService.current) {
    queueService.current = new QueueService(onJobComplete, onToast);
  }

  // Load queue from storage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const loadQueue = () => {
      try {
        const stored = loadQueueFromStorage();
        if (stored.length === 0) {
          console.log('[Queue] No stored jobs found');
          return;
        }

        console.log(`[Queue] Loaded ${stored.length} jobs from storage`);

        const now = Date.now();

        // Clean up jobs stuck in invalid states
        const cleanedJobs = stored.map((job) => {
          // Reset jobs that were processing but got stuck
          if (['preprocessing', 'running', 'processing'].includes(job.status)) {
            if ((now - job.createdAt) >= MAX_RESUME_AGE) {
              console.log(`[Queue] Removing old job ${job.id.slice(0, 8)} (older than 24h)`);
              return null; // Mark for removal
            }
            // Reset to queued so they can be resumed
            console.log(`[Queue] Resetting stuck job ${job.id.slice(0, 8)} to queued`);
            return {
              ...job,
              status: 'queued' as const,
              progress: 0,
            };
          }

          // Reset jobs stuck with progress but status=queued
          if (job.status === 'queued' && job.progress > 0) {
            console.log(`[Queue] Resetting job ${job.id.slice(0, 8)} progress to 0`);
            return {
              ...job,
              progress: 0,
            };
          }

          return job;
        }).filter((job): job is QueuedJob => job !== null);

        console.log(`[Queue] Restored ${cleanedJobs.length} jobs (${stored.length - cleanedJobs.length} removed)`);

        // Restore cleaned jobs to store
        cleanedJobs.forEach((job) => {
          useQueueStore.setState((state) => ({
            jobs: [...state.jobs, job],
          }));
        });

        // Resume jobs that need server polling
        const jobsToResume = cleanedJobs.filter((job) =>
          job.status === 'queued' && job.retryCount > 0
        );

        if (jobsToResume.length > 0) {
          console.log(`[Queue] Found ${jobsToResume.length} jobs to resume`);
          onToast(`Resuming ${jobsToResume.length} job(s) from previous session`, 'info');
        }
      } catch (error) {
        console.error('[Queue] Failed to load queue from storage:', error);
        onToast('Failed to load queue from storage', 'error');
      }
    };

    loadQueue();
  }, []);

  // Save queue to storage whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;

    const timeoutId = setTimeout(() => {
      try {
        saveQueueToStorage(jobs);
        console.log(`[Queue] Saved ${jobs.length} jobs to storage`);
      } catch (error) {
        console.error('[Queue] Failed to save queue to storage:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [jobs]);

  // Process queue
  const processQueue = useCallback(() => {
    if (!queueService.current) {
      console.warn('[Queue] Service not initialized');
      return;
    }

    const { processingJobIds } = useQueueStore.getState();
    const jobsToProcess = getJobsToProcess(MAX_CONCURRENT_JOBS);

    console.log(`[Queue] Processing check: ${jobsToProcess.length} jobs ready, ${processingJobIds.size}/${MAX_CONCURRENT_JOBS} slots used`);

    if (jobsToProcess.length === 0) {
      const allJobs = jobs;
      if (allJobs.length > 0) {
        const queuedJobs = allJobs.filter(j => j.status === 'queued');
        console.log(`[Queue] Queue status: ${queuedJobs.length} queued (${allJobs.length} total)`);

        // Debug first queued job
        if (queuedJobs.length > 0) {
          const firstJob = queuedJobs[0];
          console.log(`[Queue] First queued job: status=${firstJob.status}, progress=${firstJob.progress}, nextRetryAt=${firstJob.nextRetryAt}, inProcessing=${processingJobIds.has(firstJob.id)}`);
        }
      }
    }

    jobsToProcess.forEach((job) => {
      console.log(`[Queue] Starting job ${job.id.slice(0, 8)}: "${job.prompt.slice(0, 30)}..."`);
      if (startProcessing(job.id)) {
        // Immediately mark as processing
        updateJob(job.id, { status: 'preprocessing', progress: 5 });
        queueService.current!.processJob(job);
      } else {
        console.warn(`[Queue] Failed to start processing job ${job.id.slice(0, 8)} (already processing?)`);
      }
    });
  }, [getJobsToProcess, startProcessing, updateJob, jobs]);

  // Queue processing interval
  useEffect(() => {
    // Start processing interval
    processingInterval.current = window.setInterval(() => {
      processQueue();
    }, 2000); // Check every 2 seconds

    // Initial process
    processQueue();

    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, [processQueue]);

  // Schedule retries
  useEffect(() => {
    const now = Date.now();
    const waitingJobs = jobs.filter(
      (job) => job.status === 'queued' && job.nextRetryAt && job.nextRetryAt > now
    );

    if (waitingJobs.length === 0) return;

    // Find the next job to retry
    const nextRetryTime = Math.min(...waitingJobs.map((job) => job.nextRetryAt!));
    const delay = Math.max(0, nextRetryTime - now);

    console.log(`[Queue] Next retry in ${Math.round(delay / 1000)}s for ${waitingJobs.length} waiting job(s)`);

    const timeoutId = setTimeout(() => {
      console.log('[Queue] Retry timeout triggered');
      processQueue();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [jobs, processQueue]);

  const addToQueue = useCallback(
    (prompt: string, settings: GenerationSettings, mode: GenerationMode, mediaFile?: MediaFile) => {
      const jobId = addJob(prompt, settings, mode, mediaFile);
      console.log(`[Queue] Added new job ${jobId.slice(0, 8)}: "${prompt.slice(0, 30)}..."`);
      onToast(`Added "${prompt.slice(0, 30)}..." to queue`, 'info');
    },
    [addJob, onToast]
  );

  return {
    queuedJobs: jobs,
    addToQueue,
    removeFromQueue: removeJob,
    clearCompleted,
  };
}
