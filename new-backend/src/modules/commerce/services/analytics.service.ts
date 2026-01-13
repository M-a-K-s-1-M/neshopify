import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

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
}
