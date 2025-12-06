import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCommentTemplateDto } from '../dto/create-comment-template.dto';
import { UpdateCommentTemplateDto } from '../dto/update-comment-template.dto';

/**
 * Сервис шаблонов комментариев для повторного использования текстов.
 */
@Injectable()
export class CommentTemplatesService {
    constructor(private readonly prisma: PrismaService) { }

    /** Возвращает список шаблонов в порядке создания. */
    list() {
        return this.prisma.commentTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /** Возвращает шаблон по id, выбрасывая 404 при отсутствии. */
    async get(id: string) {
        const template = await this.prisma.commentTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Шаблон комментария не найден');
        return template;
    }

    /** Создает шаблон комментария. */
    create(dto: CreateCommentTemplateDto) {
        return this.prisma.commentTemplate.create({ data: dto });
    }

    /** Обновляет существующий шаблон. */
    async update(id: string, dto: UpdateCommentTemplateDto) {
        await this.get(id);
        return this.prisma.commentTemplate.update({ where: { id }, data: dto });
    }

    /** Удаляет шаблон. */
    async remove(id: string) {
        await this.get(id);
        await this.prisma.commentTemplate.delete({ where: { id } });
        return { removed: true };
    }
}
