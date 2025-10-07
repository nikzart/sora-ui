import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import type { QueuedJob } from '@/types/sora';

interface QueueItemProps {
  job: QueuedJob;
  onRemove: (id: string) => void;
}

const statusIcons = {
  queued: Clock,
  preprocessing: Loader2,
  running: Loader2,
  processing: Loader2,
  succeeded: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

const statusColors = {
  queued: 'text-sage-600',
  preprocessing: 'text-blue-600',
  running: 'text-blue-600',
  processing: 'text-blue-600',
  succeeded: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-600',
};

const statusLabels = {
  queued: 'Queued',
  preprocessing: 'Preprocessing',
  running: 'Running',
  processing: 'Processing',
  succeeded: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function QueueItem({ job, onRemove }: QueueItemProps) {
  const StatusIcon = statusIcons[job.status];
  const isActive = ['preprocessing', 'running', 'processing'].includes(job.status);
  const canRemove = job.status === 'queued' || job.status === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className={`flex-shrink-0 ${statusColors[job.status]}`}>
            <StatusIcon className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Prompt */}
            <h4 className="text-sm font-medium text-sage-800 line-clamp-2 mb-1">
              {job.prompt}
            </h4>

            {/* Status & Settings */}
            <div className="flex items-center gap-3 text-xs text-sage-600 mb-2">
              <span className={`font-medium ${statusColors[job.status]}`}>
                {statusLabels[job.status]}
              </span>
              <span>•</span>
              <span>
                {job.settings.width}×{job.settings.height}
              </span>
              <span>•</span>
              <span>{job.settings.duration}s</span>
              {job.settings.nVariants > 1 && (
                <>
                  <span>•</span>
                  <span>{job.settings.nVariants} variants</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {isActive && (
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-sage-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${job.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Progress Text */}
            <div className="text-xs text-sage-600">
              {isActive && <span>{job.progress}% complete</span>}
              {job.status === 'failed' && job.error && (
                <span className="text-red-600">Error: {job.error}</span>
              )}
            </div>
          </div>

          {/* Remove Button */}
          {canRemove && (
            <button
              onClick={() => onRemove(job.id)}
              className="flex-shrink-0 p-1 rounded hover:bg-red-500 hover:text-white transition-colors text-sage-600"
              title="Remove from queue"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
