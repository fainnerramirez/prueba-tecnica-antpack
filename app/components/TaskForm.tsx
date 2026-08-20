'use client';

import { FormEvent, useState } from 'react';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { createTask } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface TaskFormProps {
  onCreated: (task: Task) => void;
}

const fieldClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring';

export default function TaskForm({ onCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (!cleanDescription) {
      setError('Agrega una descripción para la tarea.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const task = await createTask({
        title: cleanTitle,
        description: cleanDescription,
        priority,
        status,
      });
      onCreated(task);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
    } catch {
      setError('No se pudo crear la tarea. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva tarea</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Título
            <input
              className={fieldClassName}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Preparar informe semanal"
              maxLength={120}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Prioridad
            <select className={fieldClassName} value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Descripción
            <textarea
              className={`${fieldClassName} min-h-24 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe el resultado esperado"
              maxLength={500}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Estado inicial
            <select className={fieldClassName} value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
            </select>
          </label>

          <div className="flex items-end justify-end gap-3 md:col-span-2">
            {error && <p className="mr-auto text-sm text-destructive">{error}</p>}
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Guardando...' : 'Agregar tarea'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}