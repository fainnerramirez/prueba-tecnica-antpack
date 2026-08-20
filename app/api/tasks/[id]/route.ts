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

  const { status, priority } = body ?? {};

  if (status === undefined && priority === undefined) {
    return NextResponse.json(
      { error: 'Debes enviar al menos status o priority' },
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

  const updated = updateTask(id, { status, priority });

  if (!updated) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}