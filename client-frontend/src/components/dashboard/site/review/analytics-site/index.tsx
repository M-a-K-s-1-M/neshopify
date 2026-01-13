'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { ChartSpline, Handbag, RussianRubleIcon, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteAnalyticsApi } from "@/lib/api/analytics";
import type { SiteAnalyticsSummaryDto } from "@/lib/types";

export type AnalyticsMetric = {
    id: string;
    title: string;
    value: string;
    icon: React.ReactNode;
};

function formatRubleAmount(value: string): string {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return `₽${safe.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
}

function formatCount(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return safe.toLocaleString('ru-RU');
}

function formatPercent(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return `${safe.toFixed(2)}%`;
}

export function AnalyticsSite() {
    const params = useParams();
    const siteId = typeof params.siteId === 'string' ? params.siteId : params.siteId?.[0];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SiteAnalyticsSummaryDto | null>(null);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!siteId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await SiteAnalyticsApi.summary(siteId);
                if (!cancelled) setSummary(res);
            } catch {
                if (!cancelled) setError('Не удалось загрузить аналитику.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [siteId]);

    const analyticsMetrics: AnalyticsMetric[] = useMemo(() => {
        return [
            {
                id: 'total-sales',
                title: 'Всего продаж',
                value: summary ? formatRubleAmount(summary.totalSales) : '—',
                icon: <RussianRubleIcon />,
            },
            {
                id: 'orders',
                title: 'Заказы',
                value: summary ? formatCount(summary.ordersCount) : '—',
                icon: <Handbag />,
            },
            {
                id: 'customers',
                title: 'Клиенты',
                value: summary ? formatCount(summary.customersCount) : '—',
                icon: <Users />,
            },
            {
                id: 'conversion',
                title: 'Конверсия',
                value: summary ? formatPercent(summary.conversionPercent) : '—',
                icon: <ChartSpline />,
            },
        ];
    }, [summary]);

    return (
        <div className="flex gap-3 flex-wrap ">
            {loading ? (
                <div className='w-full py-1 text-sm text-muted-foreground'>Загрузка аналитики…</div>
            ) : null}
            {error ? (
                <div className='w-full py-1 text-sm text-destructive'>{error}</div>
            ) : null}
            {analyticsMetrics.map(metric => (
                <Card key={metric.id} className="grow min-w-50 shadow-md rounded-sm gap-3">
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>{metric.title}</CardTitle>
                        <div className="flex justify-center items-center bg-muted p-1.5 rounded">
                            {metric.icon}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl">{metric.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
