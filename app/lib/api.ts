import axios from 'axios';
import type { Task, TaskPriority, TaskStatus } from './types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export async function getTasks(status?: TaskStatus) {
  const response = await api.get<{ data: Task[] }>('/tasks', {
    params: status ? { status } : undefined,
  });
  return response.data.data;
}

export async function createTask(data: {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
}) {
  const response = await api.post<{ data: Task }>('/tasks', data);
  return response.data.data;
}

export async function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>
) {
  const response = await api.patch<{ data: Task }>(`/tasks/${id}`, data);
  return response.data.data;
}

export default api;
