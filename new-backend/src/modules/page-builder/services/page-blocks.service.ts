import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { PagesService } from './pages.service';

/**
 * Сервис блоков страниц: управляет порядком, шаблонами и содержимым блоков.
 */
@Injectable()
export class PageBlocksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pagesService: PagesService,
    ) { }

    /** Возвращает блоки страницы после проверки ее существования. */
    async list(siteId: string, pageId: string) {
        await this.pagesService.ensurePage(siteId, pageId);
        return this.prisma.blockInstance.findMany({
            where: { pageId },
            orderBy: { order: 'asc' },
            include: { template: true, comments: true },
        });
    }

    /** Создает блок, определяет шаблон и расставляет порядок. */
    async create(siteId: string, pageId: string, dto: CreateBlockDto) {
        await this.pagesService.ensureEditablePage(siteId, pageId);

        const template = await this.resolveTemplate(dto);

        if (!template) {
            throw new NotFoundException('Шаблон не найден');
        }

        const order = await this.calculateOrder(pageId, dto.order);

        const block = await this.prisma.blockInstance.create({
            data: {
                pageId,
                templateId: template.id,
                order,
                data: dto.data,
                pinned: dto.pinned,
            },
            include: { template: true, comments: true },
        });

        await this.normalizeOrder(pageId);

        return block;
    }

    /** Обновляет блок, включая смену шаблона и порядок. */
    async update(siteId: string, pageId: string, blockId: string, dto: UpdateBlockDto) {
        await this.pagesService.ensureEditablePage(siteId, pageId);

        const block = await this.prisma.blockInstance.findFirst({ where: { id: blockId, pageId } });
        if (!block) {
            throw new NotFoundException('Блок не найден');
        }

        if (!dto.templateId && !dto.templateKey) {
            // keep current template
        } else {
            const template = await this.resolveTemplate(dto);
            if (!template) {
                throw new NotFoundException('Шаблон не найден');
            }
            dto.templateId = template.id;
        }

        const updated = await this.prisma.blockInstance.update({
            where: { id: blockId },
            data: {
                ...dto,
            },
            include: { template: true, comments: true },
        });

        if (dto.order !== undefined) {
            await this.normalizeOrder(pageId);
        }

        return updated;
    }

    /** Удаляет блок и нормализует порядок оставшихся. */
    async remove(siteId: string, pageId: string, blockId: string) {
        await this.pagesService.ensureEditablePage(siteId, pageId);
        await this.prisma.blockInstance.delete({ where: { id: blockId } });
        await this.normalizeOrder(pageId);
        return { removed: true };
    }

    /** Подбирает шаблон по id или ключу. */
    private async resolveTemplate(dto: { templateId?: string; templateKey?: string }) {
        if (dto.templateId) {
            return this.prisma.blockTemplate.findUnique({ where: { id: dto.templateId } });
        }

        if (dto.templateKey) {
            return this.prisma.blockTemplate.findUnique({ where: { key: dto.templateKey } });
        }

        return null;
    }

    /** Рассчитывает порядковый номер нового блока. */
    private async calculateOrder(pageId: string, desired?: number) {
        const count = await this.prisma.blockInstance.count({ where: { pageId } });
        if (!desired || desired > count + 1) {
            return count + 1;
        }
        return desired;
    }

    /** Перестраивает последовательность order для блоков страницы. */
    private async normalizeOrder(pageId: string) {
        const blocks = await this.prisma.blockInstance.findMany({
            where: { pageId },
            orderBy: { order: 'asc' },
            select: { id: true },
        });

        await this.prisma.$transaction(
            blocks.map((block, index) =>
                this.prisma.blockInstance.update({
                    where: { id: block.id },
                    data: { order: index + 1 },
                }),
            ),
        );
    }
}
