import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { VideoModal } from './VideoModal';
import type { SavedGeneration } from '@/types/sora';
import { formatTimestamp } from '@/lib/utils';

interface GalleryProps {
  generations: SavedGeneration[];
  onSelect: (generation: SavedGeneration) => void;
  onDelete: (id: string) => void;
  onDownload: (videoBlob: Blob, prompt: string) => void;
}

export function Gallery({ generations, onSelect, onDelete, onDownload }: GalleryProps) {
  const [selectedGeneration, setSelectedGeneration] = useState<SavedGeneration | null>(null);

  const isExpired = (generation: SavedGeneration) => {
    if (!generation.expiresAt) return false;
    return generation.expiresAt < Date.now();
  };

  if (generations.length === 0) {
    return (
      <Card className="w-full text-center py-12">
        <div className="text-sage-600">
          <p className="text-lg font-medium mb-2">No videos yet</p>
          <p className="text-sm">Your generated videos will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generations.map((generation, index) => {
          const expired = isExpired(generation);

          return (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card glass className="group overflow-hidden p-0 relative">
                {/* Expired Badge */}
                {expired && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Expired
                  </div>
                )}

                {/* Thumbnail - Click to open modal */}
                <div
                  onClick={() => !expired && setSelectedGeneration(generation)}
                  className={`relative aspect-video bg-sage-900 overflow-hidden ${
                    expired ? 'opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <img
                    src={generation.thumbnailUrl}
                    alt={generation.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {!expired && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-sage-800 ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm text-sage-800 font-medium line-clamp-2 mb-2">
                    {generation.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-sage-600">
                    <span>{formatTimestamp(generation.timestamp)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(generation.id);
                      }}
                      className="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Video Modal */}
      <VideoModal
        generation={selectedGeneration}
        onClose={() => setSelectedGeneration(null)}
        onEdit={(gen) => {
          setSelectedGeneration(null);
          onSelect(gen);
        }}
        onDownload={onDownload}
      />
    </>
  );
}
