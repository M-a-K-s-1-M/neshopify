import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';

/**
 * Сервис страниц: управляет CRUD и проверками уникальности slug.
 */
@Injectable()
export class PagesService {
    constructor(private readonly prisma: PrismaService) { }

    /** Создает страницу и валидирует уникальность slug. */
    async create(siteId: string, dto: CreatePageDto) {
        try {
            return await this.prisma.page.create({
                data: {
                    siteId,
                    title: dto.title,
                    slug: dto.slug,
                    type: dto.type,
                    isVisible: dto.isVisible,
                    seo: dto.seo,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Страница с таким slug уже существует');
            }
            throw error;
        }
    }

    /** Возвращает все страницы сайта. */
    async findAll(siteId: string) {
        return this.prisma.page.findMany({
            where: { siteId },
            orderBy: { createdAt: 'asc' },
        });
    }

    /** Загружает страницу вместе с блоками. */
    async findOne(siteId: string, pageId: string) {
        const page = await this.prisma.page.findFirst({
            where: { id: pageId, siteId },
            include: {
                blocks: {
                    orderBy: { order: 'asc' },
                    include: { template: true },
                },
            },
        });

        if (!page) {
            throw new NotFoundException('Страница не найдена');
        }

        return page;
    }

    /** Обновляет страницу и следит за уникальностью slug. */
    async update(siteId: string, pageId: string, dto: UpdatePageDto) {
        await this.ensurePage(siteId, pageId);

        try {
            return await this.prisma.page.update({
                where: { id: pageId },
                data: {
                    ...dto,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Страница с таким slug уже существует');
            }
            throw error;
        }
    }

    /** Удаляет страницу. */
    async remove(siteId: string, pageId: string) {
        await this.ensurePage(siteId, pageId);
        await this.prisma.page.delete({ where: { id: pageId } });
        return { removed: true };
    }

    /** Убеждается, что страница принадлежит сайту, и возвращает ее. */
    async ensurePage(siteId: string, pageId: string) {
        const page = await this.prisma.page.findFirst({ where: { id: pageId, siteId } });
        if (!page) {
            throw new NotFoundException('Страница не найдена');
        }
        return page;
    }
}
