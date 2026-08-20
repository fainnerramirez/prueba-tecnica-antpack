'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
];

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [updating, setUpdating] = useState(false);

  async function handleChange(value: string | null) {
    if (!value) return;

    const newStatus = value as TaskStatus;
    setUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="min-w-0 font-semibold leading-snug">
          {task.title}
        </CardTitle>
        <StatusBadge status={task.status} />
      </CardHeader>

      <CardDescription className="px-4 line-clamp-2">
        {task.description}
      </CardDescription>

      <CardFooter className="justify-between gap-2 border-t-0 bg-transparent pt-2">
        <PriorityBadge priority={task.priority} />

        <Select
          value={task.status}
          onValueChange={handleChange}
          disabled={updating}
        >
          <SelectTrigger size="sm" aria-label="Cambiar estado de la tarea">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}