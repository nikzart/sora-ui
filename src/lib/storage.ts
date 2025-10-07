import type { SavedGeneration } from '@/types/sora';

const STORAGE_KEY = 'sora-generations';
const STORAGE_VERSION = 2; // Increment when format changes
const MAX_STORAGE_ITEMS = 20; // Keep last 20 videos max

interface StoredGeneration {
  id: string;
  generationId: string;
  prompt: string;
  thumbnailUrl: string;
  timestamp: number;
  expiresAt: number | null;
  settings: any;
  mode: string;
}

interface StorageData {
  version: number;
  generations: StoredGeneration[];
}

/**
 * Save generations to localStorage (only IDs and metadata, not video data)
 */
export function saveGenerationsToStorage(generations: SavedGeneration[]): void {
  try {
    // Remove expired generations before saving
    const now = Date.now();
    const validGenerations = generations.filter((gen) => {
      if (gen.expiresAt && gen.expiresAt < now) {
        console.log(`Removing expired generation: ${gen.id}`);
        return false;
      }
      return true;
    });

    // Limit to last N items
    const itemsToSave = validGenerations.slice(0, MAX_STORAGE_ITEMS);

    // Convert to storage format (exclude videoUrl blob)
    const storedGenerations: StoredGeneration[] = itemsToSave.map((gen) => ({
      id: gen.id,
      generationId: gen.generationId,
      prompt: gen.prompt,
      thumbnailUrl: gen.thumbnailUrl,
      timestamp: gen.timestamp,
      expiresAt: gen.expiresAt,
      settings: gen.settings,
      mode: gen.mode,
    }));

    const data: StorageData = {
      version: STORAGE_VERSION,
      generations: storedGenerations,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save generations to storage:', error);
  }
}

/**
 * Load generations from localStorage
 */
export function loadGenerationsFromStorage(): SavedGeneration[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: StorageData = JSON.parse(stored);

    // Check version - clear if outdated
    if (!data.version || data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, clearing old data');
      clearGenerationsStorage();
      return [];
    }

    const now = Date.now();

    // Filter out expired generations
    const validGenerations = data.generations.filter((gen) => {
      if (gen.expiresAt && gen.expiresAt < now) {
        console.log(`Skipping expired generation: ${gen.id}`);
        return false;
      }
      return true;
    });

    // Convert to SavedGeneration format (videoUrl will be lazy-loaded)
    return validGenerations.map((gen) => ({
      id: gen.id,
      generationId: gen.generationId,
      prompt: gen.prompt,
      videoUrl: undefined, // Will be fetched on-demand
      thumbnailUrl: gen.thumbnailUrl,
      timestamp: gen.timestamp,
      expiresAt: gen.expiresAt,
      settings: gen.settings,
      mode: gen.mode as any,
    }));
  } catch (error) {
    console.error('Failed to load generations from storage:', error);
    return [];
  }
}

/**
 * Clear all generations from storage
 */
export function clearGenerationsStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear generations storage:', error);
  }
}

/**
 * Get storage size estimate in KB
 */
export function getStorageSizeEstimate(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return 0;
    }
    // Rough estimate: 1 character ≈ 2 bytes in UTF-16
    return (stored.length * 2) / 1024;
  } catch {
    return 0;
  }
}
