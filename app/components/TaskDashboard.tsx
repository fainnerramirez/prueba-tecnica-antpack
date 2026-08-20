'use client';

import { useEffect, useRef, useState } from 'react';
import { getTasks, updateTask } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

type Filter = 'all' | TaskStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completadas' },
];

interface TaskDashboardProps {
  initialTasks: Task[];
  onDataChanged: () => void;
}

export default function TaskDashboard({ initialTasks, onDataChanged }: TaskDashboardProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const initialRender = useRef(true);

  const visibleTasks = tasks.filter((task) =>
    task.title.toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase())
  );

  useEffect(() => {
    if (initialRender.current && filter === 'all' && reloadKey === 0) {
      initialRender.current = false;
      return;
    }

    let active = true;

    async function loadTasks() {
      setLoading(true);
      setError('');
      try {
        const data = await getTasks(filter === 'all' ? undefined : filter);
        if (active) setTasks(data);
      } catch {
        const message = 'No se pudieron cargar las tareas. Revisa la conexión e inténtalo de nuevo.';
        if (active) {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTasks();
    return () => {
      active = false;
    };
  }, [filter, reloadKey]);

  async function handleStatusChange(id: string, status: TaskStatus) {
    setUpdatingId(id);
    setError('');
    try {
      const updatedTask = await updateTask(id, { status });
      setTasks((current) =>
        filter !== 'all' && updatedTask.status !== filter
          ? current.filter((task) => task.id !== id)
          : current.map((task) => (task.id === id ? updatedTask : task))
      );
      toast.success('Estado de la tarea actualizado.');
      onDataChanged();
    } catch {
      const message = 'No se pudo actualizar el estado de la tarea.';
      setError(message);
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleCreated(task: Task) {
    if (filter === 'all' || filter === task.status) {
      setTasks((current) => [task, ...current]);
    }
    onDataChanged();
  }

  function handleSaved(task: Task) {
    setTasks((current) => {
      if (filter !== 'all' && task.status !== filter) {
        return current.filter((currentTask) => currentTask.id !== task.id);
      }
      const exists = current.some((currentTask) => currentTask.id === task.id);
      return exists
        ? current.map((currentTask) => (currentTask.id === task.id ? task : currentTask))
        : [task, ...current];
    });
    setEditingTask(null);
    onDataChanged();
  }

  return (
    <section className="grid gap-5">
      <TaskForm
        task={editingTask ?? undefined}
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSaved={handleSaved}
        showTrigger={false}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Mis tareas</h2>
          <p className="text-sm text-muted-foreground">Organiza y actualiza tu trabajo.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <TaskForm onSaved={handleCreated} />
          <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-1" role="tablist" aria-label="Filtrar tareas">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filter === option.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar tareas por título..."
          aria-label="Buscar tareas por título"
          className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => setReloadKey((current) => current + 1)}>
            Reintentar
          </button>
        </div>
      )}

      <TaskList
        tasks={visibleTasks}
        loading={loading}
        updatingId={updatingId}
        onStatusChange={handleStatusChange}
        onEdit={setEditingTask}
      />
    </section>
  );
}