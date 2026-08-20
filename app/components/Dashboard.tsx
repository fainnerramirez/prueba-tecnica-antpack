'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import MetricsCards from './MetricsCards';
import TaskDashboard from './TaskDashboard';

export default function Dashboard({ initialTasks }: { initialTasks: Task[] }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <MetricsCards refreshKey={refreshKey} />
      <TaskDashboard
        initialTasks={initialTasks}
        onDataChanged={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}