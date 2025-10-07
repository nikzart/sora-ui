import { AnimatePresence } from 'framer-motion';
import { QueueItem } from './QueueItem';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2 } from 'lucide-react';
import type { QueuedJob } from '@/types/sora';

interface QueueViewProps {
  jobs: QueuedJob[];
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
}

export function QueueView({ jobs, onRemove, onClearCompleted }: QueueViewProps) {
  const activeJobs = jobs.filter((job) =>
    ['queued', 'preprocessing', 'running', 'processing'].includes(job.status)
  );
  const completedJobs = jobs.filter((job) =>
    ['succeeded', 'failed', 'cancelled'].includes(job.status)
  );

  if (jobs.length === 0) {
    return (
      <Card className="w-full text-center py-12">
        <div className="text-sage-600">
          <p className="text-lg font-medium mb-2">No jobs in queue</p>
          <p className="text-sm">
            Videos you generate will be queued here and processed automatically
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-sage-800">
              Active Jobs ({activeJobs.length})
            </h3>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {activeJobs.map((job) => (
                <QueueItem key={job.id} job={job} onRemove={onRemove} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-sage-800">
              Completed ({completedJobs.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {completedJobs.map((job) => (
                <QueueItem key={job.id} job={job} onRemove={onRemove} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Queue Info */}
      <Card className="p-4">
        <div className="text-sm text-sage-600">
          <p className="mb-2">
            <strong>Queue Status:</strong> {activeJobs.length} active, {completedJobs.length}{' '}
            completed
          </p>
          <p>
            Up to 3 videos can be generated simultaneously. Additional videos will be queued
            automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
