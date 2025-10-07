import { motion } from 'framer-motion';
import { Type, Image, Video } from 'lucide-react';
import type { GenerationMode } from '@/types/sora';

interface GenerationModesProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const modes: Array<{ value: GenerationMode; label: string; icon: typeof Type }> = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'image', label: 'Image + Text', icon: Image },
  { value: 'video', label: 'Video + Text', icon: Video },
];

export function GenerationModes({ mode, onChange }: GenerationModesProps) {
  return (
    <div className="flex gap-2">
      {modes.map(({ value, label, icon: Icon }) => (
        <motion.button
          key={value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(value)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${
              mode === value
                ? 'bg-sage-600 text-white shadow-lg'
                : 'bg-white/20 backdrop-blur-sm text-sage-800 hover:bg-white/30'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          {label}
        </motion.button>
      ))}
    </div>
  );
}
