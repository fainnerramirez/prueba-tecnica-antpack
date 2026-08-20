'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { createTask, updateTask } from '@/lib/api';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface TaskFormProps {
  onSaved: (task: Task) => void;
  task?: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const fieldClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring';

export default function TaskForm({ onSaved, task, open, onOpenChange, showTrigger = true }: TaskFormProps) {
  const isEditing = Boolean(task);
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'pending');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isOpen = open ?? internalOpen;

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'medium');
    setStatus(task?.status ?? 'pending');
    setError('');
  }, [task]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && saving) return;
    onOpenChange?.(nextOpen);
    if (open === undefined) setInternalOpen(nextOpen);
  }

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
      const savedTask = isEditing && task
        ? await updateTask(task.id, {
            title: cleanTitle,
            description: cleanDescription,
            priority,
            status,
          })
        : await createTask({ title: cleanTitle, description: cleanDescription, priority, status });
      onSaved(savedTask);
      if (!isEditing) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
      }
      toast.success(isEditing ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.');
      handleOpenChange(false);
    } catch {
      const message = isEditing
        ? 'No se pudo actualizar la tarea. Inténtalo de nuevo.'
        : 'No se pudo crear la tarea. Inténtalo de nuevo.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isEditing && showTrigger && (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus />
          Nueva tarea
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza el estado o la prioridad de la tarea.' : 'Completa los datos para agregar una tarea.'}
          </DialogDescription>
        </DialogHeader>
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

          <DialogFooter className="md:col-span-2">
            {error && <p className="mr-auto text-sm text-destructive">{error}</p>}
            <Button disabled={saving} type="submit">
              {saving && <Loader2 className="animate-spin" />}
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}