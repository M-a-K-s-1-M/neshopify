import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import type { PaginationQuery } from 'src/common/pipes';
import { SiteUsersFiltersDto } from './dto/site-users-filters.dto';

const siteUserSelect = {
    id: true,
    email: true,
    banned: true,
    siteId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

type SiteUserRow = Prisma.UserGetPayload<{ select: typeof siteUserSelect }>;

@Injectable()
export class SiteUsersService {
    constructor(private readonly prisma: PrismaService) { }

    async list(siteId: string, pagination: PaginationQuery, filters: SiteUsersFiltersDto) {
        const where: Prisma.UserWhereInput = { siteId };

        if (pagination.search) {
            where.OR = [{ email: { contains: pagination.search, mode: 'insensitive' } }];
        }

        if (filters.status) {
            where.banned = filters.status === 'suspended';
        }

        if (filters.lastActiveFrom || filters.lastActiveTo) {
            const updatedAt: Prisma.DateTimeFilter = {};

            if (filters.lastActiveFrom) {
                const from = new Date(filters.lastActiveFrom);
                if (!Number.isNaN(from.getTime())) updatedAt.gte = from;
            }

            if (filters.lastActiveTo) {
                const to = new Date(filters.lastActiveTo);
                if (!Number.isNaN(to.getTime())) {
                    if (filters.lastActiveTo.length <= 10) {
                        to.setHours(23, 59, 59, 999);
                    }
                    updatedAt.lte = to;
                }
            }

            if (Object.keys(updatedAt).length) where.updatedAt = updatedAt;
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: pagination.limit,
                orderBy: { updatedAt: 'desc' },
                select: siteUserSelect,
            }),
            this.prisma.user.count({ where }),
        ]);

        const typedData = data as SiteUserRow[];

        return {
            data: typedData,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
            },
        };
    }
}
