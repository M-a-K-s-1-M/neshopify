import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { PagesService } from './pages.service';

@Injectable()
export class PageBlocksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pagesService: PagesService,
    ) { }

    async list(siteId: string, pageId: string) {
        await this.pagesService.ensurePage(siteId, pageId);
        return this.prisma.blockInstance.findMany({
            where: { pageId },
            orderBy: { order: 'asc' },
            include: { template: true, comments: true },
        });
    }

    async create(siteId: string, pageId: string, dto: CreateBlockDto) {
        await this.pagesService.ensurePage(siteId, pageId);

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

    async update(siteId: string, pageId: string, blockId: string, dto: UpdateBlockDto) {
        await this.pagesService.ensurePage(siteId, pageId);

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

    async remove(siteId: string, pageId: string, blockId: string) {
        await this.pagesService.ensurePage(siteId, pageId);
        await this.prisma.blockInstance.delete({ where: { id: blockId } });
        await this.normalizeOrder(pageId);
        return { removed: true };
    }

    private async resolveTemplate(dto: { templateId?: string; templateKey?: string }) {
        if (dto.templateId) {
            return this.prisma.blockTemplate.findUnique({ where: { id: dto.templateId } });
        }

        if (dto.templateKey) {
            return this.prisma.blockTemplate.findUnique({ where: { key: dto.templateKey } });
        }

        return null;
    }

    private async calculateOrder(pageId: string, desired?: number) {
        const count = await this.prisma.blockInstance.count({ where: { pageId } });
        if (!desired || desired > count + 1) {
            return count + 1;
        }
        return desired;
    }

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
