'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteAnalyticsApi } from "@/lib/api/analytics";
import type { SiteRegistrationsDto } from "@/lib/types";

const chartConfig: ChartConfig = {
    users: {
        label: "Регистрации",
        color: "var(--chart-4)",
    },
};

export function ChartRegisterUsers() {
    const params = useParams();
    const siteId = typeof params.siteId === 'string' ? params.siteId : params.siteId?.[0];

    const [months, setMonths] = useState<'3' | '6' | '12'>('12');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [series, setSeries] = useState<SiteRegistrationsDto | null>(null);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!siteId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await SiteAnalyticsApi.registrations(siteId, Number(months));
                if (!cancelled) setSeries(res);
            } catch {
                if (!cancelled) setError('Не удалось загрузить регистрации.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [siteId, months]);

    const chartData = useMemo(() => {
        return series?.data ?? [];
    }, [series]);

    const currentUsers = series?.currentUsers ?? 0;
    const currentLabel = series?.currentLabel ?? '';

    return (
        <div className="rounded-md bg-card shadow-md p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Регистрации пользователей</p>
                    <p className="text-2xl font-semibold">{currentUsers} {currentLabel}</p>
                </div>

                <Select value={months} onValueChange={(v) => setMonths(v as '3' | '6' | '12')}>
                    <SelectTrigger className='w-[170px]'>
                        <SelectValue placeholder='Период' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='3'>За 3 месяца</SelectItem>
                        <SelectItem value='6'>За 6 месяцев</SelectItem>
                        <SelectItem value='12'>За 12 месяцев</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {loading ? (
                <div className='py-2 text-sm text-muted-foreground'>Загрузка…</div>
            ) : null}
            {error ? (
                <div className='py-2 text-sm text-destructive'>{error}</div>
            ) : null}
            <ChartContainer config={chartConfig} className="mt-6 h-[260px] w-full">
                <AreaChart
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                >
                    <defs>
                        <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-4)" />
                            <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area
                        dataKey="users"
                        type="monotone"
                        stroke="hsl(var(--secondary))"
                        fill="url(#fillUsers)"
                        strokeWidth={2}
                        activeDot={{ r: 4 }}
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
