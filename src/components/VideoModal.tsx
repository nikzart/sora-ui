import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, Edit } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import type { SavedGeneration } from '@/types/sora';
import { soraService } from '@/services/soraService';

interface VideoModalProps {
  generation: SavedGeneration | null;
  onClose: () => void;
  onEdit: (generation: SavedGeneration) => void;
  onDownload: (videoBlob: Blob, prompt: string) => void;
}

export function VideoModal({ generation, onClose, onEdit, onDownload }: VideoModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generation) {
      return;
    }

    const loadVideo = async () => {
      // If we already have the video URL (blob), use it
      if (generation.videoUrl) {
        setVideoUrl(generation.videoUrl);
        return;
      }

      // Otherwise, fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const blob = await soraService.fetchVideoByGenerationId(generation.generationId);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoBlob(blob);
      } catch (err) {
        console.error('Failed to load video:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();

    // Cleanup blob URL on unmount
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [generation]);

  const handleDownload = () => {
    if (videoBlob && generation) {
      onDownload(videoBlob, generation.prompt);
    }
  };

  if (!generation) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-white/20">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-white line-clamp-2">
                {generation.prompt}
              </h3>
              <p className="text-sm text-sage-200 mt-1">
                {generation.settings.width}×{generation.settings.height} •{' '}
                {generation.settings.duration}s
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Content */}
          <div className="p-4">
            {isLoading && (
              <div className="aspect-video flex items-center justify-center bg-sage-900 rounded-xl">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                  <p>Loading video...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="aspect-video flex items-center justify-center bg-red-900/20 rounded-xl">
                <div className="text-center text-red-200">
                  <p className="font-medium mb-2">Failed to load video</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {videoUrl && !isLoading && !error && (
              <VideoPlayer videoUrl={videoUrl} onDownload={handleDownload} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-white/20">
            <button
              onClick={() => onEdit(generation)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit in Create
            </button>
            {videoBlob && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sage-600 hover:bg-sage-700 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
