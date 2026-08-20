'use client';

import { useEffect, useState } from 'react';
import type { TaskMetrics } from '@/lib/types';
import api from '@/lib/api';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from './ui/card';

const INITIAL_METRICS: TaskMetrics = {
    total: 0,
    byStatus: { pending: 0, in_progress: 0, completed: 0 },
    completedPercentage: 0,
};

interface MetricsCardsProps {
    refreshKey?: number;
}

export default function MetricsCards({ refreshKey = 0 }: MetricsCardsProps) {
    const [metrics, setMetrics] = useState<TaskMetrics>(INITIAL_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadMetrics() {
            try {
                const { data: { data } } = await api.get<{ data: TaskMetrics }>('/metrics');
                setMetrics(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        loadMetrics();
    }, [refreshKey]);

    const cards = [
        {
            label: 'Completadas',
            value: metrics.byStatus.completed,
            className: 'border-purple-200 bg-purple-600 text-white',
            mutedClassName: 'text-purple-100',
        },
        {
            label: 'En progreso',
            value: metrics.byStatus.in_progress,
            className: 'bg-card text-card-foreground',
            mutedClassName: 'text-muted-foreground',
        },
        {
            label: 'Pendientes',
            value: metrics.byStatus.pending,
            className: 'bg-card text-card-foreground',
            mutedClassName: 'text-muted-foreground',
        },
    ];

    return (
        <section aria-label="Métricas de tareas" className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <Card key={card.label} className={card.className}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${card.mutedClassName}`}>
                            {card.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {loading ? '...' : error ? '-' : card.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
