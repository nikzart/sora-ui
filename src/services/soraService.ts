import type {
  VideoGenerationRequest,
  VideoGenerationJob,
  MediaFile,
} from '@/types/sora';
import { ApiError } from '@/lib/apiError';

// Load from environment variables
const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
const API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const API_VERSION = import.meta.env.VITE_API_VERSION;

if (!AZURE_ENDPOINT || !API_KEY) {
  throw new Error('Missing required environment variables: VITE_AZURE_ENDPOINT and VITE_AZURE_API_KEY');
}

class SoraService {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'api-key': API_KEY,
      'Content-Type': 'application/json',
    };
  }

  async createTextToVideoJob(request: VideoGenerationRequest): Promise<VideoGenerationJob> {
    const url = `${AZURE_ENDPOINT}/openai/v1/video/generations/jobs?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        `Failed to create job: ${error}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  async createImageToVideoJob(
    request: VideoGenerationRequest,
    mediaFile: MediaFile
  ): Promise<VideoGenerationJob> {
    const url = `${AZURE_ENDPOINT}/openai/v1/video/generations/jobs?api-version=${API_VERSION}`;

    const formData = new FormData();
    formData.append('prompt', request.prompt);
    formData.append('height', request.height.toString());
    formData.append('width', request.width.toString());
    formData.append('n_seconds', request.n_seconds.toString());
    formData.append('n_variants', (request.n_variants || 1).toString());
    formData.append('model', request.model);

    const inpaintItems = [
      {
        frame_index: mediaFile.frameIndex || 0,
        type: mediaFile.type,
        file_name: mediaFile.file.name,
        crop_bounds: mediaFile.cropBounds,
      },
    ];
    formData.append('inpaint_items', JSON.stringify(inpaintItems));
    formData.append('files', mediaFile.file, mediaFile.file.name);

    const multipartHeaders = {
      'api-key': API_KEY,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: multipartHeaders,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        `Failed to create job: ${error}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationJob> {
    const url = `${AZURE_ENDPOINT}/openai/v1/video/generations/jobs/${jobId}?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        `Failed to get job status: ${error}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  async pollJobStatus(
    jobId: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<VideoGenerationJob> {
    let status: string | undefined;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max

    while (status !== 'succeeded' && status !== 'failed' && status !== 'cancelled') {
      if (attempts >= maxAttempts) {
        throw new Error('Job polling timeout');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const job = await this.getJobStatus(jobId);
      status = job.status;

      if (onStatusUpdate) {
        onStatusUpdate(status);
      }

      if (status === 'failed') {
        throw new Error(job.failure_reason || 'Job failed');
      }

      if (status === 'cancelled') {
        throw new Error('Job was cancelled');
      }

      if (status === 'succeeded') {
        return job;
      }

      attempts++;
    }

    throw new Error('Unexpected job status');
  }

  async downloadVideo(generationId: string): Promise<Blob> {
    const url = `${AZURE_ENDPOINT}/openai/v1/video/generations/${generationId}/content/video?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        `Failed to download video: ${error}`,
        response.status,
        error
      );
    }

    return response.blob();
  }

  async generateVideo(
    request: VideoGenerationRequest,
    mediaFile?: MediaFile,
    onStatusUpdate?: (status: string) => void
  ): Promise<{ job: VideoGenerationJob; videoBlob: Blob; generationId: string }> {
    // Create job
    let job: VideoGenerationJob;
    if (mediaFile) {
      job = await this.createImageToVideoJob(request, mediaFile);
    } else {
      job = await this.createTextToVideoJob(request);
    }

    if (onStatusUpdate) {
      onStatusUpdate(job.status);
    }

    // Poll for completion
    const completedJob = await this.pollJobStatus(job.id, onStatusUpdate);

    // Download video
    if (completedJob.generations.length === 0) {
      throw new Error('No generations found in completed job');
    }

    const generationId = completedJob.generations[0].id;
    const videoBlob = await this.downloadVideo(generationId);

    return { job: completedJob, videoBlob, generationId };
  }

  /**
   * Fetch video by generation ID (for lazy loading from storage)
   */
  async fetchVideoByGenerationId(generationId: string): Promise<Blob> {
    return this.downloadVideo(generationId);
  }
}


export const soraService = new SoraService();
