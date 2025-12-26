import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CheckoutDto } from '../dto/checkout.dto';
import { StripeCheckoutDto } from '../dto/stripe-checkout.dto';
import { CartService } from './cart.service';
import { PaginationQuery } from '../../../common/pipes';
import { OrderFiltersDto } from '../dto/order-filters.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { StripeService } from './stripe.service';

/**
 * Сервис заказов: формирует заказ из корзины, выдает списки и обновляет статусы.
 */
@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService,
        private readonly stripeService: StripeService,
    ) { }

    private appendQuery(url: string, params: Record<string, string>) {
        const u = new URL(url);
        for (const [key, value] of Object.entries(params)) {
            u.searchParams.set(key, value);
        }
        return u.toString();
    }

    /**
     * Преобразует текущую корзину в заказ, копирует позиции и очищает корзину после сохранения.
     */
    async checkout(siteId: string, dto: CheckoutDto, userId?: string) {
        const cart = await this.cartService.getCart(
            siteId,
            { sessionId: dto.sessionId, userId },
            false,
        );

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Корзина пуста');
        }

        const total = cart.items.reduce(
            (sum, item) => sum.add(new Prisma.Decimal(item.quantity).mul(item.price as Prisma.Decimal)),
            new Prisma.Decimal(0),
        );

        const order = await this.prisma.order.create({
            data: {
                siteId,
                cartId: cart.id,
                userId: cart.userId,
                total,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.NOT_PAID,
                shippingAddress: dto.shippingAddress ? { text: dto.shippingAddress } : undefined,
                customerEmail: dto.customerEmail,
                customerPhone: dto.customerPhone,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        title: item.product?.title ?? 'Товар',
                        price: item.price,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { items: true },
        });

        await this.cartService.internalClear(cart.id);

        return order;
    }

    /** Checkout через Stripe: создает заказ, создает Stripe Checkout Session и возвращает URL для оплаты. */
    async checkoutStripe(siteId: string, dto: StripeCheckoutDto, userId?: string) {
        const cart = await this.cartService.getCart(
            siteId,
            { sessionId: dto.sessionId, userId },
            false,
        );

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Корзина пуста');
        }

        const currencies = new Set(
            cart.items
                .map((item) => item.product?.currency)
                .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
                .map((c) => c.trim().toLowerCase()),
        );

        const currency = currencies.size === 0 ? 'rub' : Array.from(currencies)[0];
        if (currencies.size > 1) {
            throw new BadRequestException('В корзине разные валюты — Stripe checkout не поддерживает mixed currency');
        }

        const total = cart.items.reduce(
            (sum, item) => sum.add(new Prisma.Decimal(item.quantity).mul(item.price as Prisma.Decimal)),
            new Prisma.Decimal(0),
        );

        const order = await this.prisma.order.create({
            data: {
                siteId,
                cartId: cart.id,
                userId: cart.userId,
                total,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                paymentProvider: 'stripe',
                shippingAddress: dto.shippingAddress ? { text: dto.shippingAddress } : undefined,
                customerEmail: dto.customerEmail,
                customerPhone: dto.customerPhone,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        title: item.product?.title ?? 'Товар',
                        price: item.price,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { items: true },
        });

        const session = await this.stripeService.stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: dto.customerEmail,
            success_url: this.appendQuery(dto.successUrl, {
                orderId: order.id,
                session_id: '{CHECKOUT_SESSION_ID}',
            }),
            cancel_url: this.appendQuery(dto.cancelUrl, {
                orderId: order.id,
            }),
            metadata: {
                orderId: order.id,
                siteId,
            },
            line_items: cart.items.map((item) => {
                const title = item.product?.title ?? 'Товар';
                const unitAmount = Math.max(1, Math.round(Number(item.price) * 100));

                return {
                    quantity: item.quantity,
                    price_data: {
                        currency,
                        unit_amount: unitAmount,
                        product_data: {
                            name: title,
                        },
                    },
                };
            }),
        });

        if (!session.url) {
            throw new BadRequestException('Stripe не вернул URL для Checkout Session');
        }

        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                paymentSessionId: session.id,
                paymentDetails: {
                    provider: 'stripe',
                    checkoutSessionId: session.id,
                },
            },
        });

        await this.cartService.internalClear(cart.id);

        return {
            orderId: order.id,
            checkoutUrl: session.url,
        };
    }

    /**
     * Возвращает страницу заказов с фильтрами по статусам и поиском по контактам/позициям.
     */
    async list(siteId: string, pagination: PaginationQuery, filters: OrderFiltersDto) {
        const where: Prisma.OrderWhereInput = { siteId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.paymentStatus) {
            where.paymentStatus = filters.paymentStatus;
        }

        if (pagination.search) {
            where.OR = [
                { customerEmail: { contains: pagination.search, mode: 'insensitive' } },
                { customerPhone: { contains: pagination.search, mode: 'insensitive' } },
                { items: { some: { title: { contains: pagination.search, mode: 'insensitive' } } } },
            ];
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                include: { items: true },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
            },
        };
    }

    /**
     * Загружает конкретный заказ вместе с позициями для указанного сайта.
     */
    async get(siteId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, siteId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException('Заказ не найден');
        }

        return order;
    }

    /**
     * Обновляет статусы заказа (бизнес и оплата) после проверки принадлежности сайту.
     */
    async updateStatus(siteId: string, orderId: string, dto: UpdateOrderStatusDto) {
        await this.get(siteId, orderId);

        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: dto.status,
                paymentStatus: dto.paymentStatus,
            },
            include: { items: true },
        });
    }
}
