import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    private monthShortRu(monthIndex: number): string {
        const m = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        return m[monthIndex] ?? String(monthIndex + 1);
    }

    private monthLabelRu(monthIndex: number): string {
        const m = [
            'январь',
            'февраль',
            'март',
            'апрель',
            'май',
            'июнь',
            'июль',
            'август',
            'сентябрь',
            'октябрь',
            'ноябрь',
            'декабрь',
        ];
        return m[monthIndex] ?? '';
    }

    async getSiteSummary(siteId: string) {
        const [paidAgg, ordersCount, customersCount, paidOrdersCount] = await this.prisma.$transaction([
            this.prisma.order.aggregate({
                where: { siteId, paymentStatus: 'PAID' },
                _sum: { total: true },
            }),
            this.prisma.order.count({
                where: { siteId, status: { not: 'DRAFT' } },
            }),
            this.prisma.user.count({
                where: { siteId },
            }),
            this.prisma.order.count({
                where: { siteId, paymentStatus: 'PAID' },
            }),
        ]);

        const totalSales = paidAgg._sum.total ? paidAgg._sum.total.toString() : '0';

        const conversionPercent = customersCount
            ? Number(((paidOrdersCount / customersCount) * 100).toFixed(2))
            : 0;

        return {
            totalSales,
            ordersCount,
            customersCount,
            conversionPercent,
        };
    }

    async getSiteRegistrationsSeries(siteId: string, months = 12) {
        const safeMonths = Math.max(1, Math.min(24, Number(months) || 12));

        const now = new Date();
        const start = new Date(now);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        start.setMonth(start.getMonth() - (safeMonths - 1));

        const endExclusive = new Date(now);
        endExclusive.setDate(1);
        endExclusive.setHours(0, 0, 0, 0);
        endExclusive.setMonth(endExclusive.getMonth() + 1);

        const registrations = await this.prisma.user.findMany({
            where: {
                siteId,
                createdAt: {
                    gte: start,
                    lt: endExclusive,
                },
            },
            select: { createdAt: true },
        });

        const byMonth = new Map<string, number>();
        for (const r of registrations) {
            const d = r.createdAt;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
        }

        const data = Array.from({ length: safeMonths }).map((_, i) => {
            const d = new Date(start);
            d.setMonth(start.getMonth() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            return {
                month: this.monthShortRu(d.getMonth()),
                users: byMonth.get(key) ?? 0,
            };
        });

        const currentDate = new Date(start);
        currentDate.setMonth(start.getMonth() + (safeMonths - 1));
        const currentUsers = data[data.length - 1]?.users ?? 0;
        const currentLabel = this.monthLabelRu(currentDate.getMonth())
            ? `за ${this.monthLabelRu(currentDate.getMonth())}`
            : '';

        return {
            data,
            currentUsers,
            currentLabel,
        };
    }

    async getSiteOrdersSeries(siteId: string, months = 12) {
        const safeMonths = Math.max(1, Math.min(24, Number(months) || 12));

        const now = new Date();
        const start = new Date(now);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        start.setMonth(start.getMonth() - (safeMonths - 1));

        const endExclusive = new Date(now);
        endExclusive.setDate(1);
        endExclusive.setHours(0, 0, 0, 0);
        endExclusive.setMonth(endExclusive.getMonth() + 1);

        const orders = await this.prisma.order.findMany({
            where: {
                siteId,
                status: { not: 'DRAFT' },
                createdAt: {
                    gte: start,
                    lt: endExclusive,
                },
            },
            select: { createdAt: true },
        });

        const byMonth = new Map<string, number>();
        for (const o of orders) {
            const d = o.createdAt;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
        }

        const data = Array.from({ length: safeMonths }).map((_, i) => {
            const d = new Date(start);
            d.setMonth(start.getMonth() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            return {
                month: this.monthShortRu(d.getMonth()),
                orders: byMonth.get(key) ?? 0,
            };
        });

        const currentDate = new Date(start);
        currentDate.setMonth(start.getMonth() + (safeMonths - 1));
        const currentOrders = data[data.length - 1]?.orders ?? 0;
        const currentLabel = this.monthLabelRu(currentDate.getMonth())
            ? `за ${this.monthLabelRu(currentDate.getMonth())}`
            : '';

        return {
            data,
            currentOrders,
            currentLabel,
        };
    }
}
