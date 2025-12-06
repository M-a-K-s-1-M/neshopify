import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PagesService } from './pages.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class BlockCommentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pagesService: PagesService,
    ) { }

    async list(siteId: string, pageId: string, blockId: string) {
        await this.ensureBlock(siteId, pageId, blockId);
        return this.prisma.commentInstance.findMany({
            where: { blockId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(siteId: string, pageId: string, blockId: string, dto: CreateCommentDto) {
        await this.ensureBlock(siteId, pageId, blockId);

        if (dto.templateId) {
            const template = await this.prisma.commentTemplate.findUnique({ where: { id: dto.templateId } });
            if (!template) {
                throw new NotFoundException('Шаблон комментария не найден');
            }
        }

        return this.prisma.commentInstance.create({
            data: {
                blockId,
                templateId: dto.templateId,
                authorName: dto.authorName,
                avatarUrl: dto.avatarUrl,
                body: dto.body,
                rating: dto.rating,
            },
        });
    }

    async update(siteId: string, pageId: string, blockId: string, commentId: string, dto: UpdateCommentDto) {
        await this.ensureBlock(siteId, pageId, blockId);

        const comment = await this.prisma.commentInstance.findFirst({ where: { id: commentId, blockId } });
        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        return this.prisma.commentInstance.update({ where: { id: commentId }, data: dto });
    }

    async remove(siteId: string, pageId: string, blockId: string, commentId: string) {
        await this.ensureBlock(siteId, pageId, blockId);
        await this.prisma.commentInstance.delete({ where: { id: commentId } });
        return { removed: true };
    }

    private async ensureBlock(siteId: string, pageId: string, blockId: string) {
        await this.pagesService.ensurePage(siteId, pageId);
        const block = await this.prisma.blockInstance.findFirst({ where: { id: blockId, pageId } });
        if (!block) {
            throw new NotFoundException('Блок не найден');
        }
        return block;
    }
}
