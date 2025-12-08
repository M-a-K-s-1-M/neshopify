'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
    { month: "Янв", users: 320 },
    { month: "Фев", users: 410 },
    { month: "Мар", users: 365 },
    { month: "Апр", users: 450 },
    { month: "Май", users: 520 },
    { month: "Июн", users: 610 },
    { month: "Июл", users: 580 },
    { month: "Авг", users: 640 },
    { month: "Сен", users: 690 },
    { month: "Окт", users: 720 },
    { month: "Ноя", users: 760 },
    { month: "Дек", users: 810 },
];

const chartConfig: ChartConfig = {
    users: {
        label: "Регистрации",
        color: "var(--chart-4)",
    },
};

export function ChartRegisterUsers() {
    return (
        <div className="rounded-md bg-card shadow-md p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Регистрации пользователей</p>
                    <p className="text-2xl font-semibold">810 за декабрь</p>
                </div>
            </div>
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
