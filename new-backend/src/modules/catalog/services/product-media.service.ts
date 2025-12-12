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

    /** Добавляет несколько медиафайлов за одну операцию (например, после upload). */
    async createMany(siteId: string, productId: string, items: Array<Omit<CreateProductMediaDto, 'order'> & { order?: number }>) {
        await this.ensureProduct(siteId, productId);

        if (!items || items.length === 0) {
            return [];
        }

        // Чтобы не получать ошибки уникальности при массовом добавлении,
        // выставляем временный хвостовой order, затем безопасно нормализуем.
        const { _max } = await this.prisma.productMedia.aggregate({
            where: { productId },
            _max: { order: true },
        });
        let nextOrder = (_max.order ?? 0) + 1;

        const created = await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.productMedia.create({
                    data: {
                        productId,
                        url: item.url,
                        alt: item.alt,
                        order: item.order ?? nextOrder++,
                    },
                }),
            ),
        );

        await this.normalizeOrder(productId);
        return created;
    }

    /** Обновляет существующее медиа и при необходимости пересортировывает список. */
    async update(siteId: string, productId: string, mediaId: string, dto: UpdateProductMediaDto) {
        await this.ensureProduct(siteId, productId);
        await this.ensureMedia(productId, mediaId);

        // order обрабатываем отдельно, чтобы избежать коллизий уникального индекса
        const { order, ...rest } = dto;
        const media = await this.prisma.productMedia.update({
            where: { id: mediaId },
            data: rest,
        });

        if (order !== undefined) {
            await this.moveMedia(productId, mediaId, order);
            return this.prisma.productMedia.findUniqueOrThrow({ where: { id: mediaId } });
        }

        return media;
    }

    /** Удаляет медиа и нормализует порядок остальных элементов. */
    async remove(siteId: string, productId: string, mediaId: string) {
        await this.ensureProduct(siteId, productId);
        await this.ensureMedia(productId, mediaId);
        await this.prisma.productMedia.delete({ where: { id: mediaId } });
        try {
            await this.normalizeOrder(productId);
        } catch (error) {
            // Удаление уже выполнено; не заваливаем запрос ошибкой из-за нормализации порядка.
            // Нормализация может быть повторена следующими операциями (create/update/delete).
            // eslint-disable-next-line no-console
            console.error('ProductMediaService.normalizeOrder failed after delete', { productId, error });
        }
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

    /** Перенумеровывает медиафайлы в соответствии с текущим порядком (без коллизий уникальности). */
    private async normalizeOrder(productId: string) {
        const mediaIds = await this.prisma.productMedia.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
            select: { id: true },
        });

        await this.writeOrderSequence(
            productId,
            mediaIds.map((m) => m.id),
        );
    }

    private async moveMedia(productId: string, mediaId: string, desiredOrder: number) {
        const mediaIds = await this.prisma.productMedia.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
            select: { id: true },
        });
        const orderedIds = mediaIds.map((m) => m.id);
        const currentIndex = orderedIds.indexOf(mediaId);
        if (currentIndex === -1) {
            return;
        }

        const clamped = Math.max(0, Math.min(orderedIds.length - 1, desiredOrder));
        if (clamped === currentIndex) {
            return;
        }

        orderedIds.splice(currentIndex, 1);
        orderedIds.splice(clamped, 0, mediaId);
        await this.writeOrderSequence(productId, orderedIds);
    }

    /**
     * Безопасно пишет последовательность order, избегая коллизий уникального индекса (productId, order).
     * Делаем два прохода: сначала уводим все значения в уникальные временные, затем выставляем финальные.
     */
    private async writeOrderSequence(productId: string, orderedIds: string[]) {
        if (orderedIds.length <= 1) {
            if (orderedIds.length === 1) {
                await this.prisma.productMedia.update({ where: { id: orderedIds[0] }, data: { order: 0 } });
            }
            return;
        }

        // Важно: поле `order` в Prisma = Int (Postgres int4), диапазон примерно ±2.1e9.
        // Нельзя использовать Date.now() (≈1.7e12) — это приводит к integer out of range.
        // Используем безопасный отрицательный диапазон, который не пересекается с нормализованными значениями (0..n-1).
        const tempBase = -1_000_000;
        await this.prisma.$transaction([
            ...orderedIds.map((id, index) =>
                this.prisma.productMedia.update({
                    where: { id },
                    data: { order: tempBase - index },
                }),
            ),
            ...orderedIds.map((id, index) =>
                this.prisma.productMedia.update({
                    where: { id },
                    data: { order: index },
                }),
            ),
        ]);
    }
}
