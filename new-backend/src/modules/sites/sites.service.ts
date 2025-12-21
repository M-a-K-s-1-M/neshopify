import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SiteMemberRole } from '../../common/constants/site-member-role';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { SiteStructureService } from '../page-builder/services/site-structure.service';

/**
 * Сервис сайтов: управление карточками сайта и их участниками.
 */
@Injectable()
export class SitesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly siteStructure: SiteStructureService,
    ) { }

    /** Короткий алиас до prisma.site. */
    private get siteDelegate() {
        return (this.prisma as any).site;
    }

    /** Короткий алиас до prisma.siteMember. */
    private get siteMemberDelegate() {
        return (this.prisma as any).siteMember;
    }

    /** Создает сайт и нормализует slug/domain. */
    async create(ownerId: string, dto: CreateSiteDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const site = await tx.site.create({
                    data: {
                        ownerId,
                        name: dto.name,
                        slug: dto.slug.toLowerCase(),
                        domain: dto.domain?.toLowerCase(),
                        theme: dto.theme,
                        seo: dto.seo,
                        plan: dto.plan,
                    },
                });

                await this.siteStructure.provisionDefaultStructure(site.id, tx);

                await this.seedDefaultCosmeticsCategories(site.id, tx);

                return site;
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Сайт с таким значением уже существует');
            }
            throw error;
        }
    }

    private async seedDefaultCosmeticsCategories(siteId: string, tx: any) {
        const existing = await tx.productCategory.count({ where: { siteId } });
        if (existing > 0) {
            return;
        }

        const categories = [
            { name: 'Уход за лицом', slug: 'face-care' },
            { name: 'Макияж', slug: 'makeup' },
            { name: 'Уход за телом', slug: 'body-care' },
            { name: 'Уход за волосами', slug: 'hair-care' },
            { name: 'Парфюмерия', slug: 'fragrance' },
            { name: 'Ногти', slug: 'nails' },
            { name: 'Аксессуары', slug: 'accessories' },
            { name: 'Наборы и подарки', slug: 'sets-gifts' },
            { name: 'Мужская косметика', slug: 'men' },
            { name: 'Мини-форматы', slug: 'travel-size' },
        ];

        await tx.productCategory.createMany({
            data: categories.map((c) => ({
                siteId,
                name: c.name,
                slug: c.slug,
            })),
            skipDuplicates: true,
        });
    }

    /** Возвращает сайты, доступные пользователю (или все для админа). */
    async findAllForUser(userId: string, roles: string[]) {
        const isAdmin = roles.includes('ADMIN');
        const where = isAdmin
            ? undefined
            : {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
                ],
            };

        const sites = (await this.siteDelegate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
            },
        })) as any[];

        return sites;
    }

    /** Находит сайт по id вместе с участниками. */
    async findById(siteId: string) {
        const site = (await this.siteDelegate.findUnique({
            where: { id: siteId },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, email: true } },
                    },
                },
            },
        })) as any;

        if (!site) {
            throw new NotFoundException('Сайт не найден');
        }

        return site;
    }

    /** Обновляет свойства сайта. */
    async update(siteId: string, dto: UpdateSiteDto) {
        try {
            return await this.siteDelegate.update({
                where: { id: siteId },
                data: {
                    ...dto,
                    slug: dto.slug?.toLowerCase(),
                    domain: dto.domain?.toLowerCase(),
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Сайт с таким значением уже существует');
            }
            throw error;
        }
    }

    /** Переводит сайт в статус PUBLISHED и проставляет publishedAt. */
    async publish(siteId: string) {
        const existing = await this.siteDelegate.findUnique({
            where: { id: siteId },
            select: { id: true, status: true },
        });

        if (!existing) {
            throw new NotFoundException('Сайт не найден');
        }

        if (existing.status === 'ARCHIVED') {
            throw new BadRequestException('Нельзя опубликовать архивный сайт');
        }

        return this.siteDelegate.update({
            where: { id: siteId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
        });
    }

    /** Переводит сайт в статус DRAFT и очищает publishedAt. */
    async unpublish(siteId: string) {
        const existing = await this.siteDelegate.findUnique({
            where: { id: siteId },
            select: { id: true, status: true },
        });

        if (!existing) {
            throw new NotFoundException('Сайт не найден');
        }

        if (existing.status === 'ARCHIVED') {
            throw new BadRequestException('Нельзя снять с публикации архивный сайт');
        }

        return this.siteDelegate.update({
            where: { id: siteId },
            data: {
                status: 'DRAFT',
                publishedAt: null,
            },
        });
    }

    /** Полностью удаляет сайт вместе с зависимыми сущностями. */
    async remove(siteId: string) {
        return this.prisma.$transaction(async (tx) => {
            const site = await tx.site.findUnique({ where: { id: siteId }, select: { id: true } });

            if (!site) {
                throw new NotFoundException('Сайт не найден');
            }

            await tx.commentInstance.deleteMany({ where: { block: { page: { siteId } } } });
            await tx.blockInstance.deleteMany({ where: { page: { siteId } } });
            await tx.page.deleteMany({ where: { siteId } });

            await tx.productMedia.deleteMany({ where: { product: { siteId } } });
            await tx.product.deleteMany({ where: { siteId } });
            await tx.productCategory.deleteMany({ where: { siteId } });

            await tx.cartItem.deleteMany({ where: { cart: { siteId } } });
            await tx.cart.deleteMany({ where: { siteId } });

            await tx.orderItem.deleteMany({ where: { order: { siteId } } });
            await tx.order.deleteMany({ where: { siteId } });

            await tx.siteMember.deleteMany({ where: { siteId } });

            await tx.site.delete({ where: { id: siteId } });

            return { removed: true } as const;
        });
    }

    /** Возвращает участников сайта. */
    async listMembers(siteId: string) {
        const members = await this.siteMemberDelegate.findMany({
            where: { siteId },
            include: { user: { select: { id: true, email: true } } },
            orderBy: { createdAt: 'asc' },
        });

        return members;
    }

    /** Добавляет участника по email и задает роль. */
    async addMember(siteId: string, dto: AddMemberDto, currentUserId: string) {
        const targetUser = await this.prisma.user.findFirst({
            where: { email: dto.email, authScope: 'platform' },
            select: { id: true },
        });

        if (!targetUser) {
            throw new NotFoundException('Пользователь не найден');
        }

        if (targetUser.id === currentUserId) {
            throw new BadRequestException('Нельзя добавить себя как участника');
        }

        const site = await this.siteDelegate.findUnique({
            where: { id: siteId },
            select: { ownerId: true },
        });

        if (!site) {
            throw new NotFoundException('Сайт не найден');
        }

        if (site.ownerId === targetUser.id) {
            throw new BadRequestException('Владелец сайта уже имеет полный доступ');
        }

        const member = await this.siteMemberDelegate.upsert({
            where: { siteId_userId: { siteId, userId: targetUser.id } },
            create: {
                siteId,
                userId: targetUser.id,
                role: dto.role ?? SiteMemberRole.EDITOR,
            },
            update: {
                role: dto.role ?? SiteMemberRole.EDITOR,
            },
            include: { user: { select: { id: true, email: true } } },
        });

        return member;
    }

    /** Обновляет роль участника, проверяя принадлежность сайту. */
    async updateMemberRole(siteId: string, memberId: string, dto: UpdateMemberRoleDto) {
        const member = await this.siteMemberDelegate.update({
            where: { id: memberId },
            data: { role: dto.role },
            include: { user: { select: { id: true, email: true } } },
        });

        if (member.siteId !== siteId) {
            throw new BadRequestException('Участник не относится к сайту');
        }

        return member;
    }

    /** Удаляет участника из сайта. */
    async removeMember(siteId: string, memberId: string) {
        const member = await this.siteMemberDelegate.findUnique({ where: { id: memberId } });

        if (!member || member.siteId !== siteId) {
            throw new NotFoundException('Участник не найден');
        }

        await this.siteMemberDelegate.delete({ where: { id: memberId } });

        return { removed: true };
    }
}
