export type GenerationMode = 'text' | 'image' | 'video';

// UI-only types (not API parameters)
export type MovementPreset = 'none' | 'top-to-bottom' | 'bottom-to-top' | 'left-to-right' | 'eye-level';

export type AspectRatio = 'square' | 'landscape' | 'custom';

// API-aligned types
export interface CropBounds {
  left_fraction: number;
  top_fraction: number;
  right_fraction: number;
  bottom_fraction: number;
}

export interface InpaintItem {
  frame_index: number;
  type: 'image' | 'video';
  file_name: string;
  crop_bounds: CropBounds;
}

export interface VideoGenerationRequest {
  prompt: string;
  width: number;
  height: number;
  n_seconds: number;
  n_variants?: number;
  model: 'sora';
  inpaint_items?: InpaintItem[];
}

export type JobStatus = 'queued' | 'preprocessing' | 'running' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface Generation {
  id: string;
  video_url?: string;
}

export interface VideoGenerationJob {
  object: 'video.generation.job';
  id: string;
  status: JobStatus;
  created_at: number;
  finished_at: number | null;
  expires_at: number | null;
  generations: Generation[];
  prompt: string;
  model: string;
  n_variants: number;
  n_seconds: number;
  height: number;
  width: number;
  failure_reason: string | null;
}

// Resolution presets - ONLY supported resolutions from API
// Supported: (480,480), (854,480), (720,720), (1280,720), (1080,1080), (1920,1080)
export interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
  maxDuration: number; // Conservative limits based on resolution
}

export const RESOLUTION_PRESETS: Record<AspectRatio, ResolutionPreset[]> = {
  square: [
    { label: '480x480', width: 480, height: 480, maxDuration: 20 },
    { label: '720x720', width: 720, height: 720, maxDuration: 15 },
    { label: '1080x1080', width: 1080, height: 1080, maxDuration: 10 },
  ],
  landscape: [
    { label: '854x480', width: 854, height: 480, maxDuration: 20 },
    { label: '1280x720', width: 1280, height: 720, maxDuration: 15 },
    { label: '1920x1080', width: 1920, height: 1080, maxDuration: 10 },
  ],
  custom: [],
};

export interface GenerationSettings {
  // API parameters
  width: number;
  height: number;
  duration: number; // n_seconds (5-20s depending on resolution)
  nVariants: number; // n_variants (1-4)

  // UI helpers
  aspectRatio: AspectRatio;
  movementPreset: MovementPreset; // Adds text to prompt, not an API param
  maxDuration: number; // Calculated based on resolution
}

export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  cropBounds: CropBounds;
  frameIndex: number; // Where this media appears in the output video (default 0)
}

export interface SavedGeneration {
  id: string; // job ID
  generationId: string; // generation ID for fetching video
  prompt: string;
  videoUrl?: string; // Lazy-loaded blob URL
  thumbnailUrl: string;
  timestamp: number;
  expiresAt: number | null; // Video expiration timestamp
  settings: GenerationSettings;
  mode: GenerationMode;
}

export interface QueuedJob {
  id: string; // job ID
  prompt: string;
  status: JobStatus;
  progress: number; // 0-100
  settings: GenerationSettings;
  mode: GenerationMode;
  mediaFile?: MediaFile;
  createdAt: number;
  error?: string;
  retryCount: number; // Number of retry attempts
  lastRetryAt?: number; // Timestamp of last retry attempt
  nextRetryAt?: number; // Timestamp when next retry is allowed
}
