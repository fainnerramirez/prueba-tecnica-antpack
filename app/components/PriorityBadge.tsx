import { TaskPriority } from '@/lib/types';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Baja', className: 'text-slate-500' },
  medium: { label: 'Media', className: 'text-orange-600' },
  high: { label: 'Alta', className: 'text-red-600' },
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`text-xs font-semibold uppercase tracking-wide ${config.className}`}>
      ● Prioridad {config.label}
    </span>
  );
}