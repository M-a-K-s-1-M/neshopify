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

        const { order, ...rest } = dto as UpdateBlockDto & { order?: number };

        await this.prisma.blockInstance.update({
            where: { id: blockId },
            data: {
                ...rest,
            },
        });

        if (order !== undefined) {
            const desired = await this.calculateOrder(pageId, order);
            await this.moveBlock(pageId, blockId, desired);
        }

        return this.prisma.blockInstance.findUnique({
            where: { id: blockId },
            include: { template: true, comments: true },
        });
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

        await this.writeOrderSequence(pageId, blocks.map((b) => b.id));
    }

    private async moveBlock(pageId: string, blockId: string, desiredOrder: number) {
        const blocks = await this.prisma.blockInstance.findMany({
            where: { pageId },
            orderBy: { order: 'asc' },
            select: { id: true },
        });

        const ids = blocks.map((b) => b.id);
        const fromIndex = ids.indexOf(blockId);
        if (fromIndex === -1) {
            return;
        }

        const clampedOrder = Number.isFinite(desiredOrder) ? desiredOrder : fromIndex + 1;
        const toIndex = Math.max(0, Math.min(ids.length - 1, Math.round(clampedOrder) - 1));
        if (toIndex === fromIndex) {
            return;
        }

        ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, blockId);

        await this.writeOrderSequence(pageId, ids);
    }

    private async writeOrderSequence(pageId: string, orderedIds: string[]) {
        if (orderedIds.length === 0) return;

        const maxOrder = await this.prisma.blockInstance.aggregate({
            where: { pageId },
            _max: { order: true },
        });
        const base = (maxOrder._max.order ?? 0) + 1000;

        await this.prisma.$transaction([
            ...orderedIds.map((id, index) =>
                this.prisma.blockInstance.update({
                    where: { id },
                    data: { order: base + index + 1 },
                }),
            ),
            ...orderedIds.map((id, index) =>
                this.prisma.blockInstance.update({
                    where: { id },
                    data: { order: index + 1 },
                }),
            ),
        ]);
    }
}
