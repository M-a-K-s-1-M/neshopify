import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductMediaDto } from '../dto/create-product-media.dto';
import { UpdateProductMediaDto } from '../dto/update-product-media.dto';

@Injectable()
export class ProductMediaService {
    constructor(private readonly prisma: PrismaService) { }

    async list(siteId: string, productId: string) {
        await this.ensureProduct(siteId, productId);
        return this.prisma.productMedia.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
        });
    }

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

    async remove(siteId: string, productId: string, mediaId: string) {
        await this.ensureProduct(siteId, productId);
        await this.ensureMedia(productId, mediaId);
        await this.prisma.productMedia.delete({ where: { id: mediaId } });
        await this.normalizeOrder(productId);
        return { removed: true };
    }

    private async ensureProduct(siteId: string, productId: string) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, siteId } });
        if (!product) {
            throw new NotFoundException('Товар не найден');
        }
        return product;
    }

    private async ensureMedia(productId: string, mediaId: string) {
        const media = await this.prisma.productMedia.findFirst({ where: { id: mediaId, productId } });
        if (!media) {
            throw new NotFoundException('Медиафайл не найден');
        }
        return media;
    }

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
