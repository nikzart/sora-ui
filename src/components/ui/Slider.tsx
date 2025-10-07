import { cn } from '@/lib/utils';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

export function Slider({ min, max, step, value, onChange, label, className }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-sage-800">{label}</label>
          <span className="text-sm text-sage-600">{value}{typeof value === 'number' && 's'}</span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, rgb(111, 125, 95) 0%, rgb(111, 125, 95) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`,
          }}
        />
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: transform 0.15s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: transform 0.15s ease;
          }
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
        `}</style>
      </div>
    </div>
  );
}
