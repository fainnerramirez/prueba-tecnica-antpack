'use client';

import MetricsCards from './components/MetricsCards';
import TaskDashboard from './components/TaskDashboard';
import { useState } from 'react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Revisa tus tareas y sus métricas</p>
      </header>
      <MetricsCards refreshKey={refreshKey} />
      <TaskDashboard onDataChanged={() => setRefreshKey((current) => current + 1)} />
    </main>
  );
}
