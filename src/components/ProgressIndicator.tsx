import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import type { JobStatus } from '@/types/sora';

interface ProgressIndicatorProps {
  status: JobStatus;
  progress?: number;
}

const statusMessages: Record<JobStatus, string> = {
  queued: 'Queued - Waiting for processing...',
  preprocessing: 'Preprocessing - Preparing your request...',
  running: 'Running - Generating your video...',
  processing: 'Processing - Finalizing video...',
  succeeded: 'Success - Video ready!',
  failed: 'Failed - Something went wrong',
  cancelled: 'Cancelled - Generation stopped',
};

export function ProgressIndicator({ status, progress }: ProgressIndicatorProps) {
  const isActive = ['queued', 'preprocessing', 'running', 'processing'].includes(status);

  return (
    <Card className="w-full">
      <div className="flex items-center gap-4">
        {isActive && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-sage-600" />
          </motion.div>
        )}
        <div className="flex-1">
          <p className="font-medium text-sage-800 mb-2">{statusMessages[status]}</p>
          {progress !== undefined && (
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-sage-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
