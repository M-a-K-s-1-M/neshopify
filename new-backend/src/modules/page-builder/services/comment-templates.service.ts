import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCommentTemplateDto } from '../dto/create-comment-template.dto';
import { UpdateCommentTemplateDto } from '../dto/update-comment-template.dto';

@Injectable()
export class CommentTemplatesService {
    constructor(private readonly prisma: PrismaService) { }

    list() {
        return this.prisma.commentTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async get(id: string) {
        const template = await this.prisma.commentTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Шаблон комментария не найден');
        return template;
    }

    create(dto: CreateCommentTemplateDto) {
        return this.prisma.commentTemplate.create({ data: dto });
    }

    async update(id: string, dto: UpdateCommentTemplateDto) {
        await this.get(id);
        return this.prisma.commentTemplate.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.get(id);
        await this.prisma.commentTemplate.delete({ where: { id } });
        return { removed: true };
    }
}
