import { TaskStatus } from '@/lib/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  in_progress: {
    label: 'En Progreso',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Completada',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}