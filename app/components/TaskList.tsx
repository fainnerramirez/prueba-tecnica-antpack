'use client';

import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
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
const PAGE_SIZE = 6;

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  updatingId: string | null;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({ tasks, loading, updatingId, onStatusChange, onEdit }: TaskListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedTasks = tasks.slice(pageStart, pageStart + PAGE_SIZE);
  const taskSignature = tasks.map((task) => task.id).join('|');

  useEffect(() => {
    setCurrentPage(1);
  }, [taskSignature]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <div>
          <h3 className="font-semibold tracking-tight">Listado de tareas</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {loading ? 'Cargando tareas...' : `${tasks.length} ${tasks.length === 1 ? 'tarea encontrada' : 'tareas encontradas'}`}
          </p>
        </div>
        {!loading && tasks.length > 0 && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-medium">Tarea</th>
              <th className="px-5 py-3.5 font-medium">Prioridad</th>
              <th className="px-5 py-3.5 font-medium">Estado</th>
              <th className="px-5 py-3.5 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-5 py-5" colSpan={4}>
                    <Skeleton className="h-5 w-full" />
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
              paginatedTasks.map((task) => (
                <tr className="transition-colors hover:bg-muted/30" key={task.id}>
                  <td className="max-w-md px-5 py-4 align-top">
                    <p className="font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 line-clamp-1 text-muted-foreground">{task.description}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${task.priority === 'high' ? 'bg-rose-100 text-rose-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${task.status === 'completed' ? 'bg-purple-100 text-purple-700' : task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      <span className={`size-1.5 rounded-full ${task.status === 'completed' ? 'bg-purple-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === task.id ? (
                        <Skeleton className="h-7 w-28" />
                      ) : (
                        <Select
                          value={task.status}
                          onValueChange={(value) => value && onStatusChange(task.id, value as TaskStatus)}
                          disabled={updatingId === task.id}
                        >
                          <SelectTrigger size="sm" aria-label={`Cambiar estado de ${task.title}`}>
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
                      )}
                      <Button
                        aria-label={`Editar ${task.title}`}
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => onEdit(task)}
                        disabled={updatingId === task.id}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && tasks.length > 0 && (
        <div className="flex items-center justify-between gap-4 border-t bg-muted/20 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Mostrando {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, tasks.length)} de {tasks.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-16 text-center text-xs font-medium text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página siguiente"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}