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

    /**
     * Создает заказ и Stripe Checkout Session, возвращает ссылку на оплату.
     * successUrl/cancelUrl должны быть абсолютными URL.
     */
    async checkoutStripe(siteId: string, dto: StripeCheckoutDto, userId?: string) {
        const cart = await this.cartService.getCart(
            siteId,
            { sessionId: dto.sessionId, userId },
            false,
        );

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Корзина пуста');
        }

        const currency = (cart.items[0].product?.currency ?? 'RUB').toLowerCase();
        const currencyMismatch = cart.items.some(
            (item) => (item.product?.currency ?? 'RUB').toLowerCase() !== currency,
        );
        if (currencyMismatch) {
            throw new BadRequestException('В корзине смешаны разные валюты');
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

        const toMinorUnits = (value: Prisma.Decimal) => {
            const n = Number(value.toString());
            return Math.max(0, Math.round(n * 100));
        };

        const session = await this.stripeService.stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: dto.successUrl.includes('{CHECKOUT_SESSION_ID}')
                ? dto.successUrl
                : `${dto.successUrl}${dto.successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: dto.cancelUrl,
            client_reference_id: order.id,
            customer_email: dto.customerEmail,
            metadata: {
                orderId: order.id,
                siteId,
            },
            payment_intent_data: {
                metadata: {
                    orderId: order.id,
                    siteId,
                },
            },
            line_items: cart.items.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency,
                    unit_amount: toMinorUnits(item.price as Prisma.Decimal),
                    product_data: {
                        name: item.product?.title ?? 'Товар',
                        description: item.product?.description ?? undefined,
                    },
                },
            })),
        });

        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
                paymentDetails: {
                    provider: 'stripe',
                    checkoutSessionId: session.id,
                },
            },
        });

        await this.cartService.internalClear(cart.id);

        if (!session.url) {
            throw new BadRequestException('Stripe не вернул ссылку на оплату');
        }

        return { checkoutUrl: session.url };
    }

    /**
     * Возвращает страницу заказов с фильтрами по статусам и поиском по контактам/позициям.
     */
    async list(siteId: string, pagination: PaginationQuery, filters: OrderFiltersDto, includeItems = true) {
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
                include: includeItems ? { items: true } : undefined,
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

    /** Возвращает оплаченные заказы текущего пользователя (покупателя) для storefront. */
    async listMyPaid(siteId: string, userId?: string) {
        if (!userId) {
            throw new BadRequestException('Нужно войти, чтобы увидеть заказы');
        }

        return this.prisma.order.findMany({
            where: {
                siteId,
                userId,
                paymentStatus: PaymentStatus.PAID,
            },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }
}
