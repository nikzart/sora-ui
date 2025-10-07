import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Square, RectangleHorizontal, ArrowDown, ArrowUp, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Slider } from './ui/Slider';
import { Input } from './ui/Input';
import type { AspectRatio, MovementPreset, GenerationSettings, ResolutionPreset } from '@/types/sora';
import { RESOLUTION_PRESETS } from '@/types/sora';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

const aspectRatios: Array<{ value: AspectRatio; label: string; icon: typeof Square }> = [
  { value: 'square', label: 'Square (1:1)', icon: Square },
  { value: 'landscape', label: 'Landscape (16:9)', icon: RectangleHorizontal },
];

const movementPresets: Array<{ value: MovementPreset; label: string; icon: typeof ArrowDown }> = [
  { value: 'none', label: 'None', icon: Eye },
  { value: 'top-to-bottom', label: 'Top to bottom', icon: ArrowDown },
  { value: 'bottom-to-top', label: 'Bottom to top', icon: ArrowUp },
  { value: 'left-to-right', label: 'Left to right', icon: ArrowRight },
  { value: 'eye-level', label: 'Eye level', icon: Eye },
];

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDimensions, setCustomDimensions] = useState(false);

  const handleAspectRatioChange = (aspectRatio: AspectRatio) => {
    if (aspectRatio === 'custom') {
      setCustomDimensions(true);
      onSettingsChange({ ...settings, aspectRatio, maxDuration: 20 });
    } else {
      setCustomDimensions(false);
      const presets = RESOLUTION_PRESETS[aspectRatio];
      if (presets.length > 0) {
        const defaultResolution = presets[presets.length > 1 ? 1 : 0]; // Pick middle or first
        onSettingsChange({
          ...settings,
          aspectRatio,
          width: defaultResolution.width,
          height: defaultResolution.height,
          maxDuration: defaultResolution.maxDuration,
          duration: Math.min(settings.duration, defaultResolution.maxDuration),
        });
      }
    }
  };

  const handleResolutionChange = (resolution: ResolutionPreset) => {
    onSettingsChange({
      ...settings,
      width: resolution.width,
      height: resolution.height,
      maxDuration: resolution.maxDuration,
      duration: Math.min(settings.duration, resolution.maxDuration),
    });
  };

  return (
    <Card className="w-80 h-fit space-y-6">
      <div className="flex items-center gap-2 text-sage-800">
        <Settings className="w-5 h-5" />
        <h3 className="font-semibold">Video Settings</h3>
      </div>

      {/* Aspect Ratio */}
      <div>
        <h4 className="text-sm font-medium text-sage-800 mb-3">Aspect Ratio</h4>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatios.map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAspectRatioChange(value)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-xs
                ${
                  settings.aspectRatio === value
                    ? 'bg-sage-600 text-white'
                    : 'bg-white/20 text-sage-800 hover:bg-white/30'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-center leading-tight">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Resolution Presets */}
      {!customDimensions && settings.aspectRatio !== 'custom' && (
        <div>
          <h4 className="text-sm font-medium text-sage-800 mb-3">Resolution</h4>
          <div className="flex flex-wrap gap-2">
            {RESOLUTION_PRESETS[settings.aspectRatio].map((resolution) => (
              <motion.button
                key={resolution.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleResolutionChange(resolution)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${
                    settings.width === resolution.width && settings.height === resolution.height
                      ? 'bg-sage-600 text-white'
                      : 'bg-white/20 text-sage-800 hover:bg-white/30'
                  }
                `}
              >
                {resolution.label}
              </motion.button>
            ))}
          </div>
          <button
            onClick={() => setCustomDimensions(true)}
            className="text-xs text-sage-600 hover:text-sage-800 mt-2 transition-colors"
          >
            Use custom dimensions
          </button>
        </div>
      )}

      {/* Custom Dimensions */}
      {customDimensions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-sage-800">Custom Dimensions</h4>
            <button
              onClick={() => {
                setCustomDimensions(false);
                handleAspectRatioChange(settings.aspectRatio === 'custom' ? 'landscape' : settings.aspectRatio);
              }}
              className="text-xs text-sage-600 hover:text-sage-800 transition-colors"
            >
              Use presets
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Width"
                type="number"
                min={256}
                max={1920}
                value={settings.width}
                onChange={(e) =>
                  onSettingsChange({ ...settings, width: Number(e.target.value), aspectRatio: 'custom' })
                }
              />
              <Input
                label="Height"
                type="number"
                min={256}
                max={1920}
                value={settings.height}
                onChange={(e) =>
                  onSettingsChange({ ...settings, height: Number(e.target.value), aspectRatio: 'custom' })
                }
              />
            </div>
            <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2">
              ⚠️ <strong>Warning:</strong> Only these resolutions are supported: 480×480, 854×480, 720×720, 1280×720, 1080×1080, 1920×1080
            </div>
          </div>
        </div>
      )}

      {/* Duration */}
      <div>
        <Slider
          label="Duration"
          min={5}
          max={settings.maxDuration}
          step={5}
          value={settings.duration}
          onChange={(duration) => onSettingsChange({ ...settings, duration })}
        />
        <p className="text-xs text-sage-600 mt-1">
          Max duration for {settings.width}x{settings.height}: {settings.maxDuration}s
        </p>
      </div>

      {/* Number of Variants */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-sage-800">Number of Variants</label>
          <span className="text-sm text-sage-600">{settings.nVariants}</span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          step={1}
          value={settings.nVariants}
          onChange={(e) => onSettingsChange({ ...settings, nVariants: Number(e.target.value) })}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${
              ((settings.nVariants - 1) / 3) * 100
            }%, rgba(255, 255, 255, 0.2) ${
              ((settings.nVariants - 1) / 3) * 100
            }%, rgba(255, 255, 255, 0.2) 100%)`,
          }}
        />
        <p className="text-xs text-sage-600 mt-1">
          Generate multiple variations of your video (increases cost)
        </p>
      </div>

      {/* Advanced Settings - Collapsible */}
      <div className="pt-4 border-t border-white/20">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-sage-800 hover:text-sage-900 transition-colors mb-3"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Settings
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Movement Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-sage-800">Camera Movement</h4>
                  <span className="text-xs text-sage-500">(adds to prompt)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {movementPresets.map(({ value, label, icon: Icon }) => (
                    <motion.button
                      key={value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSettingsChange({ ...settings, movementPreset: value })}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg transition-all text-xs
                        ${
                          settings.movementPreset === value
                            ? 'bg-sage-600 text-white'
                            : 'bg-white/20 text-sage-800 hover:bg-white/30'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-sage-600 mt-2">
                  This adds camera movement hints to your prompt (not an API parameter)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="pt-4 border-t border-white/20">
        <div className="text-xs text-sage-600 space-y-1">
          <p>
            <strong>Resolution:</strong> {settings.width}x{settings.height}
          </p>
          <p>
            <strong>Total variants:</strong> {settings.nVariants}
          </p>
          <p>
            <strong>Est. cost:</strong> ~${(settings.duration * 0.5 * settings.nVariants).toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}
