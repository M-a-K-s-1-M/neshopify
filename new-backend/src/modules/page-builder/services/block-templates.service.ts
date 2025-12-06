import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { BlockSchemaRegistry } from '../schemas/block-schema.registry';
import { CreateBlockTemplateDto } from '../dto/create-block-template.dto';
import { UpdateBlockTemplateDto } from '../dto/update-block-template.dto';

/**
 * Управляет шаблонами блоков и регистром схем данных.
 */
@Injectable()
export class BlockTemplatesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly registry: BlockSchemaRegistry,
    ) { }

    /** Возвращает все шаблоны блоков. */
    async list() {
        return this.prisma.blockTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Загружает шаблон по id. */
    async get(id: string) {
        const template = await this.prisma.blockTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Шаблон не найден');
        return template;
    }

    /** Создает шаблон, подставляя схему из регистра и проверяя уникальность ключа. */
    async create(dto: CreateBlockTemplateDto) {
        try {
            const schema = dto.schema ?? this.registry.get(dto.key)?.schema;
            if (!schema) {
                throw new BadRequestException('Для указанного ключа нет схемы');
            }

            return await this.prisma.blockTemplate.create({
                data: {
                    key: dto.key,
                    title: dto.title,
                    description: dto.description,
                    category: dto.category,
                    schema,
                    previewUrl: dto.previewUrl,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Шаблон с таким ключом уже существует');
            }
            throw error;
        }
    }

    /** Обновляет шаблон и проверяет уникальность ключа. */
    async update(id: string, dto: UpdateBlockTemplateDto) {
        await this.get(id);

        try {
            return await this.prisma.blockTemplate.update({
                where: { id },
                data: {
                    ...dto,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Шаблон с таким ключом уже существует');
            }
            throw error;
        }
    }

    /** Удаляет шаблон после проверки его существования. */
    async remove(id: string) {
        await this.get(id);
        await this.prisma.blockTemplate.delete({ where: { id } });
        return { removed: true };
    }

    /** Возвращает список доступных схем из регистра. */
    listRegisteredSchemas() {
        return this.registry.list();
    }
}
