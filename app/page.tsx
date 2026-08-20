import { getTasks } from '@/lib/db';
import Dashboard from './components/Dashboard';

export default function Home() {
  const initialTasks = getTasks();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Revisa tus tareas y sus métricas</p>
      </header>
      <Dashboard initialTasks={initialTasks} />
    </main>
  );
}
