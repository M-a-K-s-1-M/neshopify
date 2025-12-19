import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { PagesService } from '../services/pages.service';

/**
 * Публичные read-only эндпоинты для storefront (готового магазина).
 * Нужны, чтобы страницы могли рендериться без авторизации (preview и published).
 */
@Controller('storefront/sites')
@ApiTags('Storefront')
export class StorefrontController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pagesService: PagesService,
    ) { }

    @Get('by-slug/:slug')
    @ApiOkResponse({ description: 'Публичная информация о сайте по slug (без members).' })
    async getSiteBySlug(@Param('slug') slug: string) {
        const site = await this.prisma.site.findFirst({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                status: true,
                ownerId: true,
                theme: true,
                seo: true,
                plan: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!site) {
            throw new NotFoundException('Сайт не найден');
        }

        return site;
    }

    @Get(':siteId')
    @ApiOkResponse({ description: 'Публичная информация о сайте (без members).' })
    async getSite(@Param('siteId') siteId: string) {
        const site = await this.prisma.site.findUnique({
            where: { id: siteId },
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                status: true,
                ownerId: true,
                theme: true,
                seo: true,
                plan: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!site) {
            throw new NotFoundException('Сайт не найден');
        }

        return site;
    }

    @Get(':siteId/pages')
    @ApiOkResponse({ description: 'Список страниц сайта (публичный).' })
    async getPages(@Param('siteId') siteId: string) {
        return this.pagesService.findAll(siteId);
    }

    @Get(':siteId/pages/:pageId')
    @ApiOkResponse({ description: 'Детали страницы вместе с блоками (публичный).' })
    async getPage(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pagesService.findOne(siteId, pageId);
    }
}
