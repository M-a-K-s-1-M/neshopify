import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    list(siteId: string) {
        return this.prisma.productCategory.findMany({
            where: { siteId },
            orderBy: [
                { parentId: 'asc' },
                { name: 'asc' },
            ],
        });
    }

    async get(siteId: string, categoryId: string) {
        return this.ensureCategory(siteId, categoryId);
    }

    async create(siteId: string, dto: CreateCategoryDto) {
        if (dto.parentId) {
            await this.ensureCategory(siteId, dto.parentId);
        }

        try {
            return await this.prisma.productCategory.create({
                data: {
                    siteId,
                    name: dto.name,
                    slug: dto.slug,
                    parentId: dto.parentId,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Категория с таким slug уже существует на сайте');
            }
            throw error;
        }
    }

    async update(siteId: string, categoryId: string, dto: UpdateCategoryDto) {
        const category = await this.ensureCategory(siteId, categoryId);

        if (dto.parentId) {
            if (dto.parentId === categoryId) {
                throw new BadRequestException('Категория не может быть родителем самой себя');
            }
            await this.ensureCategory(siteId, dto.parentId);
        }

        try {
            return await this.prisma.productCategory.update({
                where: { id: category.id },
                data: {
                    ...dto,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Категория с таким slug уже существует на сайте');
            }
            throw error;
        }
    }

    async remove(siteId: string, categoryId: string) {
        await this.ensureCategory(siteId, categoryId);

        const hasChildren = await this.prisma.productCategory.count({ where: { parentId: categoryId } });
        if (hasChildren > 0) {
            throw new BadRequestException('Нельзя удалить категорию с дочерними элементами');
        }

        const hasProducts = await this.prisma.product.count({ where: { categoryId } });
        if (hasProducts > 0) {
            throw new BadRequestException('Нельзя удалить категорию с прикрепленными товарами');
        }

        await this.prisma.productCategory.delete({ where: { id: categoryId } });
        return { removed: true };
    }

    private async ensureCategory(siteId: string, categoryId: string) {
        const category = await this.prisma.productCategory.findFirst({ where: { id: categoryId, siteId } });
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }
        return category;
    }
}
