'use client';

import type { Task, TaskStatus } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada',
};

const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta' } as const;

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  updatingId: string | null;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export default function TaskList({ tasks, loading, updatingId, onStatusChange }: TaskListProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-medium">Tarea</th>
              <th className="px-5 py-4 font-medium">Prioridad</th>
              <th className="px-5 py-4 font-medium">Estado</th>
              <th className="px-5 py-4 text-right font-medium">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-5 py-5" colSpan={4}>
                    <div className="h-5 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}

            {!loading && tasks.length === 0 && (
              <tr>
                <td className="px-5 py-12 text-center text-muted-foreground" colSpan={4}>
                  No hay tareas en este estado.
                </td>
              </tr>
            )}

            {!loading &&
              tasks.map((task) => (
                <tr className="transition-colors hover:bg-muted/30" key={task.id}>
                  <td className="max-w-md px-5 py-4">
                    <p className="font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 line-clamp-1 text-muted-foreground">{task.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <span className={`size-2 rounded-full ${task.status === 'completed' ? 'bg-purple-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Select
                      value={task.status}
                      onValueChange={(value) => value && onStatusChange(task.id, value as TaskStatus)}
                      disabled={updatingId === task.id}
                    >
                      <SelectTrigger className="ml-auto" size="sm" aria-label={`Cambiar estado de ${task.title}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}