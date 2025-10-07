import { Card } from './ui/Card';
import type { CropBounds } from '@/types/sora';

interface CropBoundsEditorProps {
  cropBounds: CropBounds;
  onChange: (bounds: CropBounds) => void;
  className?: string;
}

export function CropBoundsEditor({ cropBounds, onChange, className }: CropBoundsEditorProps) {
  const handleChange = (field: keyof CropBounds, value: number) => {
    onChange({
      ...cropBounds,
      [field]: value,
    });
  };

  return (
    <Card glass className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-sage-800">Crop Bounds</h4>
          <button
            onClick={() =>
              onChange({
                left_fraction: 0.0,
                top_fraction: 0.0,
                right_fraction: 1.0,
                bottom_fraction: 1.0,
              })
            }
            className="text-xs text-sage-600 hover:text-sage-800 transition-colors"
          >
            Reset to Full
          </button>
        </div>

        <p className="text-xs text-sage-600">
          Adjust which portion of the media to use (as fractions from each edge)
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-sage-700 mb-1 block">
              Left Edge: {(cropBounds.left_fraction * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={cropBounds.left_fraction}
              onChange={(e) => handleChange('left_fraction', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${
                  (cropBounds.left_fraction / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) ${
                  (cropBounds.left_fraction / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
            />
          </div>

          <div>
            <label className="text-xs text-sage-700 mb-1 block">
              Top Edge: {(cropBounds.top_fraction * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={cropBounds.top_fraction}
              onChange={(e) => handleChange('top_fraction', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${
                  (cropBounds.top_fraction / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) ${
                  (cropBounds.top_fraction / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
            />
          </div>

          <div>
            <label className="text-xs text-sage-700 mb-1 block">
              Right Edge: {(cropBounds.right_fraction * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={cropBounds.right_fraction}
              onChange={(e) => handleChange('right_fraction', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${
                  ((cropBounds.right_fraction - 0.5) / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) ${
                  ((cropBounds.right_fraction - 0.5) / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
            />
          </div>

          <div>
            <label className="text-xs text-sage-700 mb-1 block">
              Bottom Edge: {(cropBounds.bottom_fraction * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={cropBounds.bottom_fraction}
              onChange={(e) => handleChange('bottom_fraction', Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${
                  ((cropBounds.bottom_fraction - 0.5) / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) ${
                  ((cropBounds.bottom_fraction - 0.5) / 0.5) * 100
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Visual Indicator */}
        <div className="relative aspect-video bg-sage-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bg-sage-500/30 border-2 border-sage-400"
            style={{
              left: `${cropBounds.left_fraction * 100}%`,
              top: `${cropBounds.top_fraction * 100}%`,
              right: `${(1 - cropBounds.right_fraction) * 100}%`,
              bottom: `${(1 - cropBounds.bottom_fraction) * 100}%`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                Active Area
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-sage-600 bg-sage-100/50 rounded-lg p-2">
          <p>
            <strong>Crop Area:</strong>{' '}
            {((cropBounds.right_fraction - cropBounds.left_fraction) * 100).toFixed(0)}% ×{' '}
            {((cropBounds.bottom_fraction - cropBounds.top_fraction) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
