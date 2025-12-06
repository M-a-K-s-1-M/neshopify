import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductMediaDto } from '../dto/create-product-media.dto';
import { UpdateProductMediaDto } from '../dto/update-product-media.dto';

/**
 * Сервис медиафайлов товаров: поддерживает их список, порядок и валидации.
 */
@Injectable()
export class ProductMediaService {
    constructor(private readonly prisma: PrismaService) { }

    /** Возвращает список медиа после проверки принадлежности товара сайту. */
    async list(siteId: string, productId: string) {
        await this.ensureProduct(siteId, productId);
        return this.prisma.productMedia.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
        });
    }

    /** Добавляет медиафайл и расставляет порядок отображения. */
    async create(siteId: string, productId: string, dto: CreateProductMediaDto) {
        await this.ensureProduct(siteId, productId);
        const order = await this.resolveOrder(productId, dto.order);

        const media = await this.prisma.productMedia.create({
            data: {
                productId,
                url: dto.url,
                alt: dto.alt,
                order,
            },
        });

        await this.normalizeOrder(productId);
        return media;
    }

    /** Обновляет существующее медиа и при необходимости пересортировывает список. */
    async update(siteId: string, productId: string, mediaId: string, dto: UpdateProductMediaDto) {
        await this.ensureProduct(siteId, productId);
        await this.ensureMedia(productId, mediaId);

        const media = await this.prisma.productMedia.update({
            where: { id: mediaId },
            data: {
                ...dto,
            },
        });

        if (dto.order !== undefined) {
            await this.normalizeOrder(productId);
        }

        return media;
    }

    /** Удаляет медиа и нормализует порядок остальных элементов. */
    async remove(siteId: string, productId: string, mediaId: string) {
        await this.ensureProduct(siteId, productId);
        await this.ensureMedia(productId, mediaId);
        await this.prisma.productMedia.delete({ where: { id: mediaId } });
        await this.normalizeOrder(productId);
        return { removed: true };
    }

    /** Проверяет, что товар существует и принадлежит сайту. */
    private async ensureProduct(siteId: string, productId: string) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, siteId } });
        if (!product) {
            throw new NotFoundException('Товар не найден');
        }
        return product;
    }

    /** Проверяет существование конкретного медиафайла. */
    private async ensureMedia(productId: string, mediaId: string) {
        const media = await this.prisma.productMedia.findFirst({ where: { id: mediaId, productId } });
        if (!media) {
            throw new NotFoundException('Медиафайл не найден');
        }
        return media;
    }

    /** Определяет порядковый номер для новой записи (или использует переданный). */
    private async resolveOrder(productId: string, desired?: number) {
        if (desired !== undefined) {
            return desired;
        }

        const { _max } = await this.prisma.productMedia.aggregate({
            where: { productId },
            _max: { order: true },
        });

        return (_max.order ?? 0) + 1;
    }

    /** Перенумеровывает медиафайлы в соответствии с текущим порядком. */
    private async normalizeOrder(productId: string) {
        const media = await this.prisma.productMedia.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
            select: { id: true },
        });

        await this.prisma.$transaction(
            media.map((item, index) =>
                this.prisma.productMedia.update({
                    where: { id: item.id },
                    data: { order: index },
                }),
            ),
        );
    }
}
