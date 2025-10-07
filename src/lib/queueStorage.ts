import type { QueuedJob } from '@/types/sora';

const QUEUE_STORAGE_KEY = 'sora-queue';
const QUEUE_STORAGE_VERSION = 1;
const MAX_QUEUE_ITEMS = 50; // Keep max 50 jobs

interface StoredJob {
  id: string;
  prompt: string;
  status: string;
  progress: number;
  settings: any;
  mode: string;
  createdAt: number;
  error?: string;
  hadMediaFile: boolean; // Flag indicating job originally had media (but can't serialize it)
  retryCount: number;
  lastRetryAt?: number;
  nextRetryAt?: number;
}

interface QueueStorageData {
  version: number;
  jobs: StoredJob[];
}

/**
 * Save queued jobs to localStorage (excluding mediaFile data)
 */
export function saveQueueToStorage(jobs: QueuedJob[]): void {
  try {
    // Filter out succeeded jobs (they're already in gallery)
    // Only keep jobs that are queued, in progress, or failed
    const now = Date.now();
    const jobsToSave = jobs.filter((job) => {
      // Remove succeeded jobs
      if (job.status === 'succeeded') {
        return false;
      }
      // Remove old failed jobs (older than 24 hours)
      if (job.status === 'failed' && now - job.createdAt > 24 * 60 * 60 * 1000) {
        return false;
      }
      return true;
    });

    // Limit to max items
    const limitedJobs = jobsToSave.slice(0, MAX_QUEUE_ITEMS);

    // Convert to storage format (exclude mediaFile)
    const storedJobs: StoredJob[] = limitedJobs.map((job) => ({
      id: job.id,
      prompt: job.prompt,
      status: job.status,
      progress: job.progress,
      settings: job.settings,
      mode: job.mode,
      createdAt: job.createdAt,
      error: job.error,
      hadMediaFile: !!job.mediaFile, // Track if job had media
      retryCount: job.retryCount,
      lastRetryAt: job.lastRetryAt,
      nextRetryAt: job.nextRetryAt,
    }));

    const data: QueueStorageData = {
      version: QUEUE_STORAGE_VERSION,
      jobs: storedJobs,
    };

    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save queue to storage:', error);
  }
}

/**
 * Load queued jobs from localStorage
 */
export function loadQueueFromStorage(): QueuedJob[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: QueueStorageData = JSON.parse(stored);

    // Check version - clear if outdated
    if (!data.version || data.version !== QUEUE_STORAGE_VERSION) {
      console.warn('Queue storage version mismatch, clearing old data');
      clearQueueStorage();
      return [];
    }

    // Convert to QueuedJob format
    return data.jobs.map((job) => ({
      id: job.id,
      prompt: job.prompt,
      status: job.status as any,
      progress: job.progress,
      settings: job.settings,
      mode: job.mode as any,
      createdAt: job.createdAt,
      error: job.error,
      // mediaFile is not restored (can't serialize File objects)
      mediaFile: undefined,
      retryCount: job.retryCount || 0,
      lastRetryAt: job.lastRetryAt,
      nextRetryAt: job.nextRetryAt,
    }));
  } catch (error) {
    console.error('Failed to load queue from storage:', error);
    return [];
  }
}

/**
 * Clear queue storage
 */
export function clearQueueStorage(): void {
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear queue storage:', error);
  }
}

/**
 * Get storage size estimate in KB
 */
export function getQueueStorageSizeEstimate(): number {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!stored) {
      return 0;
    }
    // Rough estimate: 1 character ≈ 2 bytes in UTF-16
    return (stored.length * 2) / 1024;
  } catch {
    return 0;
  }
}
