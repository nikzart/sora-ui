/**
 * Debug utilities for troubleshooting queue and storage issues
 * These functions can be called from the browser console
 */

/**
 * Clear all queue data from localStorage
 * Usage: window.clearQueueStorage()
 */
export function clearQueueStorage(): void {
  try {
    localStorage.removeItem('queueStore');
    console.log('[Debug] Queue storage cleared');
    window.location.reload();
  } catch (error) {
    console.error('[Debug] Failed to clear queue storage:', error);
  }
}

/**
 * Clear all gallery data from localStorage
 * Usage: window.clearGalleryStorage()
 */
export function clearGalleryStorage(): void {
  try {
    localStorage.removeItem('generations');
    console.log('[Debug] Gallery storage cleared');
    window.location.reload();
  } catch (error) {
    console.error('[Debug] Failed to clear gallery storage:', error);
  }
}

/**
 * Clear all app data from localStorage
 * Usage: window.clearAllStorage()
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear();
    console.log('[Debug] All storage cleared');
    window.location.reload();
  } catch (error) {
    console.error('[Debug] Failed to clear storage:', error);
  }
}

/**
 * Inspect current queue state
 * Usage: window.inspectQueue()
 */
export function inspectQueue(): void {
  try {
    const queueData = localStorage.getItem('queueStore');
    if (!queueData) {
      console.log('[Debug] No queue data found');
      return;
    }

    const parsed = JSON.parse(queueData);
    console.log('[Debug] Queue storage:', parsed);
    console.log(`[Debug] Total jobs: ${parsed.length}`);

    // Group by status
    const byStatus: Record<string, number> = {};
    parsed.forEach((job: any) => {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    });
    console.log('[Debug] Jobs by status:', byStatus);

    // Show jobs with issues
    const stuck = parsed.filter((job: any) =>
      job.status === 'queued' && job.progress > 0
    );
    if (stuck.length > 0) {
      console.warn('[Debug] Jobs stuck with progress:', stuck);
    }

    const processing = parsed.filter((job: any) =>
      ['preprocessing', 'running', 'processing'].includes(job.status)
    );
    if (processing.length > 0) {
      console.warn('[Debug] Jobs in processing state:', processing);
    }
  } catch (error) {
    console.error('[Debug] Failed to inspect queue:', error);
  }
}

/**
 * Inspect current gallery state
 * Usage: window.inspectGallery()
 */
export function inspectGallery(): void {
  try {
    const galleryData = localStorage.getItem('generations');
    if (!galleryData) {
      console.log('[Debug] No gallery data found');
      return;
    }

    const parsed = JSON.parse(galleryData);
    console.log('[Debug] Gallery storage:', parsed);
    console.log(`[Debug] Total generations: ${parsed.length}`);
  } catch (error) {
    console.error('[Debug] Failed to inspect gallery:', error);
  }
}

/**
 * Check environment variables
 * Usage: window.checkEnv()
 */
export function checkEnv(): void {
  const vars = {
    'VITE_AZURE_ENDPOINT': import.meta.env.VITE_AZURE_ENDPOINT,
    'VITE_AZURE_API_KEY': import.meta.env.VITE_AZURE_API_KEY ? '[SET]' : '[MISSING]',
    'VITE_API_VERSION': import.meta.env.VITE_API_VERSION,
    'VITE_O4_MINI_ENDPOINT': import.meta.env.VITE_O4_MINI_ENDPOINT,
    'VITE_O4_MINI_DEPLOYMENT': import.meta.env.VITE_O4_MINI_DEPLOYMENT,
    'VITE_O4_MINI_API_VERSION': import.meta.env.VITE_O4_MINI_API_VERSION,
  };

  console.log('[Debug] Environment variables:', vars);

  const missing = Object.entries(vars).filter(([_, value]) => !value);
  if (missing.length > 0) {
    console.warn('[Debug] Missing environment variables:', missing.map(([key]) => key));
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).clearQueueStorage = clearQueueStorage;
  (window as any).clearGalleryStorage = clearGalleryStorage;
  (window as any).clearAllStorage = clearAllStorage;
  (window as any).inspectQueue = inspectQueue;
  (window as any).inspectGallery = inspectGallery;
  (window as any).checkEnv = checkEnv;
}
