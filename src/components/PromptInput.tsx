import { useState } from 'react';
import { Sparkles, Wand2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { augmentPrompt } from '../services/promptAugmentationService';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PromptInput({ value, onChange, onGenerate, isGenerating }: PromptInputProps) {
  const maxLength = 500;
  const characterCount = value.length;

  // Augmentation state
  const [isAugmentationEnabled, setIsAugmentationEnabled] = useState(false);
  const [isAugmenting, setIsAugmenting] = useState(false);
  const [augmentedPrompt, setAugmentedPrompt] = useState<string | null>(null);
  const [augmentationError, setAugmentationError] = useState<string | null>(null);

  const handleAugmentPrompt = async () => {
    if (!value.trim()) {
      setAugmentationError('Please enter a prompt first');
      return;
    }

    setIsAugmenting(true);
    setAugmentationError(null);

    try {
      const enhanced = await augmentPrompt(value);
      setAugmentedPrompt(enhanced);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance prompt';
      setAugmentationError(errorMessage);
      console.error('Prompt augmentation error:', error);
    } finally {
      setIsAugmenting(false);
    }
  };

  const handleApplyAugmented = () => {
    if (augmentedPrompt) {
      onChange(augmentedPrompt);
      setAugmentedPrompt(null);
      setAugmentationError(null);
    }
  };

  const handleRevertAugmented = () => {
    setAugmentedPrompt(null);
    setAugmentationError(null);
  };

  return (
    <Card className="w-full">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <motion.div
              className="w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center"
              animate={isAugmenting ? {
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              } : {}}
              transition={{
                duration: 2,
                repeat: isAugmenting ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-sage-800">Prompt</h3>

              {/* Augmentation Toggle */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAugmentationEnabled}
                    onChange={(e) => setIsAugmentationEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      isAugmentationEnabled ? 'bg-sage-600' : 'bg-sage-300'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full shadow-md mt-0.5"
                      animate={{ x: isAugmentationEnabled ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                  <span className="text-xs text-sage-700 font-medium group-hover:text-sage-900 transition-colors">
                    AI Enhance
                  </span>
                </label>
              </div>
            </div>

            {/* Textarea with shimmer effect when augmenting */}
            <div className="relative">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Create a captivating video that seamlessly transitions between impressive frames, highlighting subtle movements and vivid colors. Emphasize fluid storytelling with dynamic..."
                rows={3}
                maxLength={maxLength}
                className={`resize-none transition-all ${
                  isAugmenting ? 'opacity-70' : ''
                }`}
                disabled={isAugmenting}
              />

              {/* Shimmer overlay when augmenting */}
              <AnimatePresence>
                {isAugmenting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Augmented Prompt Preview */}
            <AnimatePresence>
              {augmentedPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-3 bg-sage-50 border border-sage-200 rounded-lg"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-sage-800 mb-1">Enhanced Prompt</p>
                      <p className="text-sm text-sage-700 leading-relaxed">{augmentedPrompt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={handleApplyAugmented}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply
                    </Button>
                    <Button
                      onClick={handleRevertAugmented}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Discard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {augmentationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700"
                >
                  {augmentationError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-sage-600">
                {characterCount}/{maxLength}
              </span>
              <div className="flex gap-2">
                {/* Augment Button */}
                {isAugmentationEnabled && !augmentedPrompt && (
                  <Button
                    onClick={handleAugmentPrompt}
                    disabled={isAugmenting || !value.trim()}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={isAugmenting ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isAugmenting ? Infinity : 0, ease: "linear" }}
                    >
                      <Wand2 className="w-4 h-4" />
                    </motion.div>
                    {isAugmenting ? 'Enhancing...' : 'Enhance'}
                  </Button>
                )}

                {/* Generate Button */}
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating || !value.trim()}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
