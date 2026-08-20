import { NextRequest, NextResponse } from 'next/server';
import { updateTask } from '@/lib/db';
import { TaskStatus, TaskPriority } from '@/lib/types';

const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { title, description, status, priority } = body ?? {};

  if (title === undefined && description === undefined && status === undefined && priority === undefined) {
    return NextResponse.json(
      { error: 'Debes enviar al menos un campo para actualizar' },
      { status: 400 }
    );
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    return NextResponse.json(
      { error: 'El título debe tener al menos 3 caracteres' },
      { status: 400 }
    );
  }
  if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
    return NextResponse.json(
      { error: 'La descripción no puede estar vacía' },
      { status: 400 }
    );
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Estado inválido. Usa: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return NextResponse.json(
      { error: `Prioridad inválida. Usa: ${VALID_PRIORITIES.join(', ')}` },
      { status: 400 }
    );
  }

  const updated = updateTask(id, {
    title: typeof title === 'string' ? title.trim() : undefined,
    description: typeof description === 'string' ? description.trim() : undefined,
    status,
    priority,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}