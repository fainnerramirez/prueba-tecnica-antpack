import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';
import { Task, TaskStatus, TaskPriority, TaskMetrics } from './types';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Crear tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// Seed inicial si la tabla está vacía
const { count } = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
if (count === 0) {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO tasks (id, title, description, priority, status, createdAt)
    VALUES (@id, @title, @description, @priority, @status, @createdAt)
  `);
  [
    { id: randomUUID(), title: 'Diseñar wireframes del dashboard', description: 'Bocetos iniciales de la interfaz en Figma', priority: 'high', status: 'pending', createdAt: now },
    { id: randomUUID(), title: 'Configurar proyecto Next.js', description: 'Inicializar repositorio y dependencias base', priority: 'medium', status: 'completed', createdAt: now },
    { id: randomUUID(), title: 'Implementar API de tareas', description: 'Endpoints REST para CRUD de tareas', priority: 'high', status: 'in_progress', createdAt: now },
  ].forEach((t) => insert.run(t));
}

export function getTasks(status?: TaskStatus): Task[] {
  if (status) {
    return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC').all(status) as Task[];
  }
  return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
}

export function createTask(data: {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
}): Task {
  const task: Task = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
  db.prepare(`
    INSERT INTO tasks (id, title, description, priority, status, createdAt)
    VALUES (@id, @title, @description, @priority, @status, @createdAt)
  `).run(task);
  return task;
}

export function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>
): Task | null {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  if (!existing) return null;

  const updated: Task = {
    ...existing,
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    status: data.status ?? existing.status,
    priority: data.priority ?? existing.priority,
  };

  db.prepare('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?').run(
    updated.title,
    updated.description,
    updated.status,
    updated.priority,
    id
  );
  return updated;
}

export function getMetrics(): TaskMetrics {
  const total = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
  const rows = db
    .prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status')
    .all() as { status: TaskStatus; count: number }[];

  const byStatus: Record<TaskStatus, number> = { pending: 0, in_progress: 0, completed: 0 };
  rows.forEach((r) => {
    byStatus[r.status] = r.count;
  });

  const completedPercentage = total === 0 ? 0 : Math.round((byStatus.completed / total) * 100);
  return { total, byStatus, completedPercentage };
}