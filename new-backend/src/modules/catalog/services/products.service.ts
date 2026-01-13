import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockStatus } from '../../../../generated/prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { PaginationQuery } from '../../../common/pipes';

/**
 * Сервис каталога товаров: фильтрация, CRUD и проверки SKU/категорий.
 */
@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Формирует страницу товаров с фильтрами и сортировкой. */
    async list(siteId: string, filters: ProductFiltersDto, pagination: PaginationQuery) {
        const where: Prisma.ProductWhereInput = {
            siteId,
        };

        if (pagination.search) {
            where.OR = [
                { title: { contains: pagination.search, mode: 'insensitive' } },
                { description: { contains: pagination.search, mode: 'insensitive' } },
                { sku: { contains: pagination.search, mode: 'insensitive' } },
            ];
        }

        if (filters.categoryIds?.length) {
            where.categoryId = { in: filters.categoryIds };
        } else if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.stockStatus) {
            where.stockStatus = filters.stockStatus;
        }

        if (filters.inStock !== undefined) {
            where.stock = filters.inStock ? { gt: 0 } : { equals: 0 };
        }

        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            where.price = {
                gte: filters.priceMin !== undefined ? new Prisma.Decimal(filters.priceMin) : undefined,
                lte: filters.priceMax !== undefined ? new Prisma.Decimal(filters.priceMax) : undefined,
            };
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    media: { orderBy: { order: 'asc' } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: items,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
            },
        };
    }

    /** Возвращает товар, гарантируя, что он принадлежит сайту. */
    async get(siteId: string, productId: string) {
        return this.ensureProduct(siteId, productId);
    }

    /** Создает товар с валидацией категории и обработкой дубликатов SKU. */
    async create(siteId: string, dto: CreateProductDto) {
        if (dto.categoryId) {
            await this.ensureCategory(siteId, dto.categoryId);
        }

        try {
            return await this.prisma.product.create({
                data: {
                    siteId,
                    title: dto.title,
                    description: dto.description,
                    price: new Prisma.Decimal(dto.price),
                    currency: dto.currency ?? 'RUB',
                    sku: dto.sku,
                    stock: dto.stock ?? 0,
                    stockStatus: dto.stockStatus ?? StockStatus.IN_STOCK,
                    categoryId: dto.categoryId,
                },
                include: {
                    category: true,
                    media: { orderBy: { order: 'asc' } },
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Товар с таким SKU уже существует на сайте');
            }
            throw error;
        }
    }

    /** Обновляет товар, повторно проверяя категорию и SKU. */
    async update(siteId: string, productId: string, dto: UpdateProductDto) {
        await this.ensureProduct(siteId, productId);

        if (dto.categoryId) {
            await this.ensureCategory(siteId, dto.categoryId);
        }

        try {
            return await this.prisma.product.update({
                where: { id: productId },
                data: {
                    ...dto,
                    price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
                },
                include: {
                    category: true,
                    media: { orderBy: { order: 'asc' } },
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Товар с таким SKU уже существует на сайте');
            }
            throw error;
        }
    }

    /** Удаляет товар после проверки его существования. */
    async remove(siteId: string, productId: string) {
        await this.ensureProduct(siteId, productId);

        const orderItemsCount = await this.prisma.orderItem.count({
            where: {
                productId,
                order: {
                    siteId,
                },
            },
        });

        if (orderItemsCount > 0) {
            throw new BadRequestException('Нельзя удалить товар: он используется в заказах');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.cartItem.deleteMany({ where: { productId } });
            await tx.productMedia.deleteMany({ where: { productId } });
            await tx.product.delete({ where: { id: productId } });
        });

        return { removed: true };
    }

    /** Проверяет существование товара и возвращает его с медиаданными. */
    private async ensureProduct(siteId: string, productId: string) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, siteId },
            include: {
                category: true,
                media: { orderBy: { order: 'asc' } },
            },
        });
        if (!product) {
            throw new NotFoundException('Товар не найден');
        }
        return product;
    }

    /** Проверяет наличие категории на сайте. */
    private async ensureCategory(siteId: string, categoryId: string) {
        const category = await this.prisma.productCategory.findFirst({ where: { id: categoryId, siteId } });
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }
        return category;
    }
}
