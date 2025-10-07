import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { QueuedJob, GenerationSettings, GenerationMode, MediaFile } from '@/types/sora';

interface QueueState {
  jobs: QueuedJob[];
  processingJobIds: Set<string>;

  // Actions
  addJob: (prompt: string, settings: GenerationSettings, mode: GenerationMode, mediaFile?: MediaFile) => string;
  updateJob: (id: string, updates: Partial<QueuedJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;

  // Processing state
  startProcessing: (id: string) => boolean;
  stopProcessing: (id: string) => void;
  isProcessing: (id: string) => boolean;

  // Queries
  getJob: (id: string) => QueuedJob | undefined;
  getJobsToProcess: (maxConcurrent: number) => QueuedJob[];
}

export const useQueueStore = create<QueueState>((set, get) => ({
  jobs: [],
  processingJobIds: new Set<string>(),

  addJob: (prompt, settings, mode, mediaFile) => {
    const id = uuidv4();
    const newJob: QueuedJob = {
      id,
      prompt,
      status: 'queued',
      progress: 0,
      settings,
      mode,
      mediaFile,
      createdAt: Date.now(),
      retryCount: 0,
    };

    set((state) => ({
      jobs: [...state.jobs, newJob],
    }));

    return id;
  },

  updateJob: (id, updates) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
    }));
  },

  removeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
      processingJobIds: new Set(
        Array.from(state.processingJobIds).filter((jobId) => jobId !== id)
      ),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter(
        (job) => job.status !== 'succeeded' && job.status !== 'failed'
      ),
    }));
  },

  startProcessing: (id) => {
    const state = get();
    if (state.processingJobIds.has(id)) {
      return false; // Already processing
    }

    set((state) => ({
      processingJobIds: new Set([...state.processingJobIds, id]),
    }));

    return true;
  },

  stopProcessing: (id) => {
    set((state) => {
      const newSet = new Set(state.processingJobIds);
      newSet.delete(id);
      return { processingJobIds: newSet };
    });
  },

  isProcessing: (id) => {
    return get().processingJobIds.has(id);
  },

  getJob: (id) => {
    return get().jobs.find((job) => job.id === id);
  },

  getJobsToProcess: (maxConcurrent) => {
    const state = get();
    const now = Date.now();
    const processingCount = state.processingJobIds.size;
    const slotsAvailable = maxConcurrent - processingCount;

    if (slotsAvailable <= 0) {
      return [];
    }

    return state.jobs
      .filter((job) =>
        job.status === 'queued' &&
        job.progress === 0 &&
        (!job.nextRetryAt || job.nextRetryAt <= now) &&
        !state.processingJobIds.has(job.id)
      )
      .slice(0, slotsAvailable);
  },
}));
