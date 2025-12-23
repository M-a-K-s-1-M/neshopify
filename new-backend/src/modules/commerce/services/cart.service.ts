import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

/**
 * Сервис управления корзиной: хранение позиций, подсчет содержимого и проверка товаров.
 */
@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    /** Возвращает корзину с продуктами либо выбрасывает 404. */
    async getCart(siteId: string, opts: { sessionId?: string; userId?: string }, createIfMissing = true) {
        const cart = await this.resolveCart(siteId, opts, createIfMissing);
        if (!cart) {
            throw new NotFoundException('Корзина не найдена');
        }
        return this.prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    /** Добавляет новый товар или обновляет количество существующего. */
    async addItem(siteId: string, dto: AddCartItemDto, userId?: string) {
        const cart = await this.resolveCart(siteId, { sessionId: dto.sessionId, userId }, true);
        if (!cart) {
            throw new NotFoundException('Корзина не найдена');
        }
        const product = await this.ensureProduct(siteId, dto.productId);

        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: product.id },
        });

        if (existing) {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: {
                    quantity: existing.quantity + dto.quantity,
                },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: product.id,
                    quantity: dto.quantity,
                    price: product.price,
                },
            });
        }

        return this.getCart(siteId, { sessionId: dto.sessionId, userId }, true);
    }

    /** Обновляет количество для конкретной позиции корзины. */
    async updateItem(siteId: string, itemId: string, dto: UpdateCartItemDto, userId?: string) {
        const cart = await this.resolveCart(siteId, { sessionId: dto.sessionId, userId }, false);
        if (!cart) {
            throw new NotFoundException('Корзина не найдена');
        }

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });

        if (!item) {
            throw new NotFoundException('Позиция корзины не найдена');
        }

        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: dto.quantity },
        });

        return this.getCart(siteId, { sessionId: dto.sessionId, userId }, true);
    }

    /** Удаляет позицию и возвращает актуальное состояние корзины. */
    async removeItem(siteId: string, itemId: string, opts: { sessionId?: string; userId?: string }) {
        const cart = await this.resolveCart(siteId, opts, false);
        if (!cart) {
            return this.emptyCart(siteId, opts.sessionId);
        }

        await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
        return this.getCart(siteId, opts, true);
    }

    /** Очистка всех позиций корзины пользователя. */
    async clearCart(siteId: string, opts: { sessionId?: string; userId?: string }) {
        const cart = await this.resolveCart(siteId, opts, false);
        if (!cart) {
            return this.emptyCart(siteId, opts.sessionId);
        }

        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.getCart(siteId, opts, true);
    }

    /** Вспомогательный метод для удаления всех позиций по cartId (используется заказами). */
    async internalClear(cartId: string) {
        await this.prisma.cartItem.deleteMany({ where: { cartId } });
    }

    /** Ищет или создает корзину по siteId/userId (для авторизованных) или siteId/sessionId (для гостей). */
    private async resolveCart(siteId: string, opts: { sessionId?: string; userId?: string }, createIfMissing: boolean) {
        const userId = opts.userId;
        const sessionId = opts.sessionId;

        if (!userId && !sessionId) {
            throw new BadRequestException('Не указан userId или sessionId');
        }

        let cart = userId
            ? await this.prisma.cart.findFirst({ where: { siteId, userId } })
            : await this.prisma.cart.findFirst({ where: { siteId, sessionId } });

        if (!cart && createIfMissing) {
            cart = await this.prisma.cart.create({
                data: {
                    siteId,
                    userId: userId ?? null,
                    sessionId: userId ? null : (sessionId ?? null),
                },
            });
        }

        return cart;
    }

    /** Проверяет, что товар принадлежит сайту, и возвращает его. */
    private async ensureProduct(siteId: string, productId: string) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, siteId } });
        if (!product) {
            throw new NotFoundException('Товар не найден');
        }
        return product;
    }

    /** Возвращает пустую корзину-заглушку, если реальная еще не создана. */
    private async emptyCart(siteId: string, sessionId?: string) {
        return {
            siteId,
            sessionId: sessionId ?? null,
            items: [],
            total: new Prisma.Decimal(0),
        };
    }
}
