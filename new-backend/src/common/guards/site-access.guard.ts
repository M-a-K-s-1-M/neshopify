import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { SITE_ACCESS_KEY, SiteAccessRequirement } from '../decorators/site-access.decorator';

@Injectable()
export class SiteAccessGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requirement = this.reflector.getAllAndOverride<SiteAccessRequirement>(SITE_ACCESS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requirement) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request & { user?: any }>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Необходима авторизация');
        }

        const siteId =
            request.params?.siteId ||
            request.params?.id ||
            request.body?.siteId ||
            (request.query?.siteId as string | undefined);

        if (!siteId) {
            throw new BadRequestException('Не указан идентификатор сайта');
        }

        const site = (await this.prisma.site.findUnique({
            where: { id: siteId },
            select: {
                id: true,
                ownerId: true,
                members: {
                    where: { userId: user.sub },
                    select: { id: true, role: true },
                },
            },
        })) as
            | {
                id: string;
                ownerId: string;
                members: Array<{ id: string; role: string }>;
            }
            | null;

        if (!site) {
            throw new NotFoundException('Сайт не найден');
        }

        const isOwner = site.ownerId === user.sub;
        const isMember = site.members.length > 0;
        const isAdmin = user.roles?.includes('ADMIN');
        const isCustomerForThisSite = user.roles?.includes('CUSTOMER') && user.siteId === siteId;

        if (requirement === SiteAccessRequirement.OWNER) {
            if (isOwner || isAdmin) {
                return true;
            }
            throw new ForbiddenException('Недостаточно прав: требуется владелец сайта');
        }

        // MEMBER: допускаем владельца/участника/админа, а также покупателя своего магазина.
        if (isOwner || isMember || isAdmin || isCustomerForThisSite) {
            return true;
        }

        throw new ForbiddenException('Нет доступа к сайту');
    }
}
