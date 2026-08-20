'use client';

import { useEffect, useState } from 'react';
import { getTasks, updateTask } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

type Filter = 'all' | TaskStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completadas' },
];

export default function TaskDashboard({ onDataChanged }: { onDataChanged: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      setLoading(true);
      setError('');
      try {
        const data = await getTasks(filter === 'all' ? undefined : filter);
        if (active) setTasks(data);
      } catch {
        if (active) setError('No se pudieron cargar las tareas. Revisa la conexión e inténtalo de nuevo.');
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
      onDataChanged();
    } catch {
      setError('No se pudo actualizar el estado de la tarea.');
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

  return (
    <section className="grid gap-5">
      <TaskForm onCreated={handleCreated} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Mis tareas</h2>
          <p className="text-sm text-muted-foreground">Organiza y actualiza tu trabajo.</p>
        </div>
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

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => setReloadKey((current) => current + 1)}>
            Reintentar
          </button>
        </div>
      )}

      <TaskList tasks={tasks} loading={loading} updatingId={updatingId} onStatusChange={handleStatusChange} />
    </section>
  );
}