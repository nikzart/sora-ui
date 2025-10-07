import { useEffect, useRef, useCallback } from 'react';
import { useQueueStore } from '@/stores/queueStore';
import { QueueService } from '@/services/queueService';
import { saveQueueToStorage, loadQueueFromStorage } from '@/lib/queueStorage';
import type { SavedGeneration, GenerationSettings, GenerationMode, MediaFile } from '@/types/sora';

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
        if (stored.length === 0) return;

        console.log(`Loaded ${stored.length} queued jobs from storage`);

        // Restore jobs to store
        stored.forEach((job) => {
          useQueueStore.setState((state) => ({
            jobs: [...state.jobs, job],
          }));
        });

        // Resume jobs that were in progress (and not too old)
        const now = Date.now();
        const inProgressJobs = stored.filter((job) =>
          ['preprocessing', 'running', 'processing'].includes(job.status) &&
          (now - job.createdAt) < MAX_RESUME_AGE
        );

        // Clean up old jobs
        const oldJobs = stored.filter((job) =>
          ['preprocessing', 'running', 'processing'].includes(job.status) &&
          (now - job.createdAt) >= MAX_RESUME_AGE
        );

        if (oldJobs.length > 0) {
          console.log(`Removing ${oldJobs.length} old job(s) from queue (older than 24h)`);
          oldJobs.forEach((job) => removeJob(job.id));
        }

        if (inProgressJobs.length > 0) {
          onToast(`Resuming ${inProgressJobs.length} job(s) from previous session`, 'info');
          inProgressJobs.forEach((job) => {
            if (startProcessing(job.id)) {
              queueService.current?.resumeJob(job);
            }
          });
        }
      } catch (error) {
        console.error('Failed to load queue from storage:', error);
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
        console.log(`Saved ${jobs.length} jobs to queue storage`);
      } catch (error) {
        console.error('Failed to save queue to storage:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [jobs]);

  // Process queue
  const processQueue = useCallback(() => {
    if (!queueService.current) return;

    const jobsToProcess = getJobsToProcess(MAX_CONCURRENT_JOBS);

    jobsToProcess.forEach((job) => {
      if (startProcessing(job.id)) {
        // Immediately mark as processing
        updateJob(job.id, { status: 'preprocessing', progress: 5 });
        queueService.current!.processJob(job);
      }
    });
  }, [getJobsToProcess, startProcessing, updateJob]);

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

    console.log(`Next retry in ${Math.round(delay / 1000)}s`);

    const timeoutId = setTimeout(() => {
      processQueue();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [jobs, processQueue]);

  const addToQueue = useCallback(
    (prompt: string, settings: GenerationSettings, mode: GenerationMode, mediaFile?: MediaFile) => {
      addJob(prompt, settings, mode, mediaFile);
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
