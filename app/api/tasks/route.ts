import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';
import { TaskStatus, TaskPriority } from '@/lib/types';

const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') as TaskStatus | null;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Estado inválido. Usa: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const tasks = getTasks(status ?? undefined);
  return NextResponse.json({ data: tasks });
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { title, description, priority, status } = body ?? {};

  if (typeof title !== 'string' || title.trim().length < 3) {
    return NextResponse.json(
      { error: 'El título es requerido y debe tener al menos 3 caracteres' },
      { status: 400 }
    );
  }
  if (typeof description !== 'string') {
    return NextResponse.json({ error: 'La descripción es requerida' }, { status: 400 });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return NextResponse.json(
      { error: `Prioridad inválida. Usa: ${VALID_PRIORITIES.join(', ')}` },
      { status: 400 }
    );
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Estado inválido. Usa: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const task = createTask({ title: title.trim(), description, priority, status });
  return NextResponse.json({ data: task }, { status: 201 });
}