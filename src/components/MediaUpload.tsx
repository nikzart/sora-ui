import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { CropBoundsEditor } from './CropBoundsEditor';
import { Input } from './ui/Input';
import type { MediaFile } from '@/types/sora';

interface MediaUploadProps {
  mediaFile: MediaFile | null;
  onMediaChange: (file: MediaFile | null) => void;
  accept: 'image' | 'video' | 'both';
  maxDuration?: number;
}

export function MediaUpload({ mediaFile, onMediaChange, accept, maxDuration = 60 }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCropEditor, setShowCropEditor] = useState(false);

  const acceptTypes = {
    image: 'image/*',
    video: 'video/*',
    both: 'image/*,video/*',
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [accept]
  );

  const handleFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (
      (accept === 'image' && !isImage) ||
      (accept === 'video' && !isVideo) ||
      (!isImage && !isVideo)
    ) {
      return;
    }

    const preview = URL.createObjectURL(file);
    const newMediaFile: MediaFile = {
      file,
      preview,
      type: isImage ? 'image' : 'video',
      cropBounds: {
        left_fraction: 0.0,
        top_fraction: 0.0,
        right_fraction: 1.0,
        bottom_fraction: 1.0,
      },
      frameIndex: 0,
    };

    onMediaChange(newMediaFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (mediaFile) {
      URL.revokeObjectURL(mediaFile.preview);
      onMediaChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <AnimatePresence mode="wait">
          {!mediaFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors
                ${isDragging ? 'border-sage-600 bg-sage-50/50' : 'border-white/30 hover:border-sage-400'}
              `}
            >
              <input
                type="file"
                accept={acceptTypes[accept]}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-sage-600" />
                </div>
                <div>
                  <p className="text-sage-800 font-medium mb-1">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-sm text-sage-600">
                    {accept === 'image' && 'Supports: JPG, PNG, WebP'}
                    {accept === 'video' && 'Supports: MP4, WebM, MOV'}
                    {accept === 'both' && 'Supports: Images and Videos'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="relative">
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="rounded-xl overflow-hidden">
                  {mediaFile.type === 'image' ? (
                    <img
                      src={mediaFile.preview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaFile.preview}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-sage-700">
                  {mediaFile.type === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <VideoIcon className="w-4 h-4" />
                  )}
                  <span className="font-medium truncate flex-1">{mediaFile.file.name}</span>
                  <span className="text-sage-600">
                    ({(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Frame Index & Crop Editor - only show when media is loaded */}
      {mediaFile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Frame Index Input */}
          <Card>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sage-800">
                Frame Position (seconds)
              </label>
              <p className="text-xs text-sage-600">
                At which second should this {mediaFile.type} appear in the output? (0 = start)
              </p>
              <Input
                type="number"
                min={0}
                max={maxDuration}
                value={mediaFile.frameIndex}
                onChange={(e) => {
                  const frameIndex = Math.max(0, Math.min(maxDuration, Number(e.target.value)));
                  onMediaChange({ ...mediaFile, frameIndex });
                }}
                placeholder="0"
              />
            </div>
          </Card>

          {/* Crop Bounds Editor - Collapsible */}
          <div>
            <button
              onClick={() => setShowCropEditor(!showCropEditor)}
              className="flex items-center gap-2 text-sm font-medium text-sage-800 hover:text-sage-900 transition-colors mb-2"
            >
              {showCropEditor ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showCropEditor ? 'Hide' : 'Show'} Crop Editor
            </button>
            <AnimatePresence>
              {showCropEditor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CropBoundsEditor
                    cropBounds={mediaFile.cropBounds}
                    onChange={(cropBounds) => onMediaChange({ ...mediaFile, cropBounds })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
