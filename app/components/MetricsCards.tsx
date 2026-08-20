'use client';

import { useEffect, useState } from 'react';
import type { TaskMetrics } from '@/lib/types';
import api from '@/lib/api';
import { CheckCircle2, Clock3, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Skeleton } from './ui/skeleton';

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
        setLoading(true);
        setError(false);

        async function loadMetrics() {
            try {
                const { data: { data } } = await api.get<{ data: TaskMetrics }>('/metrics');
                setMetrics(data);
            } catch {
                setError(true);
                toast.error('No se pudieron cargar las métricas.');
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
            percentage: metrics.completedPercentage,
            icon: CheckCircle2,
            className: 'border-purple-500/30 bg-purple-600 text-white shadow-purple-200/50',
            iconClassName: 'bg-white/15 text-purple-100',
            mutedClassName: 'text-purple-100',
        },
        {
            label: 'En progreso',
            value: metrics.byStatus.in_progress,
            percentage: metrics.total === 0 ? 0 : Math.round((metrics.byStatus.in_progress / metrics.total) * 100),
            icon: Clock3,
            className: 'bg-card text-card-foreground',
            iconClassName: 'bg-amber-100 text-amber-700',
            mutedClassName: 'text-muted-foreground',
        },
        {
            label: 'Pendientes',
            value: metrics.byStatus.pending,
            percentage: metrics.total === 0 ? 0 : Math.round((metrics.byStatus.pending / metrics.total) * 100),
            icon: ListTodo,
            className: 'bg-card text-card-foreground',
            iconClassName: 'bg-slate-100 text-slate-700',
            mutedClassName: 'text-muted-foreground',
        },
    ];

    return (
        <section aria-label="Métricas de tareas" className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <Card key={card.label} className={`gap-5 border shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md ${card.className}`}>
                    <CardHeader className="flex flex-row items-start justify-between pb-0">
                        <div className="grid gap-1">
                            <CardTitle className={`text-sm font-medium ${card.mutedClassName}`}>
                                {card.label}
                            </CardTitle>
                            <p className={`text-xs ${card.mutedClassName}`}>{card.percentage}% del total</p>
                        </div>
                        <div className={`flex size-10 items-center justify-center rounded-xl ${card.iconClassName}`}>
                            <card.icon className="size-5" aria-hidden="true" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className={`h-10 w-20 ${card.className.includes('text-white') ? 'bg-purple-500' : ''}`} />
                        ) : (
                            <div className="flex items-end justify-between gap-4">
                                <div className="text-4xl font-bold tracking-tight">{error ? '-' : card.value}</div>
                                {card.label === 'Completadas' && !error && (
                                    <span className={`text-xs font-medium ${card.mutedClassName}`}>avance</span>
                                )}
                            </div>
                        )}
                        {card.label === 'Completadas' && !loading && !error && (
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20" aria-label={`${metrics.completedPercentage}% de tareas completadas`}>
                                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${metrics.completedPercentage}%` }} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
