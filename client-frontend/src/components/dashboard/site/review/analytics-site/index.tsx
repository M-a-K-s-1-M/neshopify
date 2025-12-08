'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { ChartSpline, Handbag, RussianRubleIcon, Users } from "lucide-react";

export type AnalyticsMetric = {
    id: string;
    title: string;
    value: string;
    trend: "up" | "down";
    delta: string;
    subtitle: string;
    icon: React.ReactNode;
};

export const analyticsMetrics: AnalyticsMetric[] = [
    {
        id: "total-sales",
        title: "Всего продаж",
        value: "₽847,392",
        trend: "up",
        delta: "+12.5%",
        subtitle: "за месяц",
        icon: <RussianRubleIcon />
    },
    {
        id: "orders",
        title: "Заказы",
        value: "1,248",
        trend: "up",
        delta: "+8.2%",
        subtitle: "за месяц",
        icon: <Handbag />
    },
    {
        id: "customers",
        title: "Клиенты",
        value: "3,842",
        trend: "up",
        delta: "+15.3%",
        subtitle: "за месяц",
        icon: <Users />
    },
    {
        id: "conversion",
        title: "Конверсия",
        value: "3.24%",
        trend: "down",
        delta: "-2.1%",
        subtitle: "за месяц",
        icon: <ChartSpline />
    },
];

export function AnalyticsSite() {
    return (
        <div className="flex gap-3 flex-wrap ">
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
