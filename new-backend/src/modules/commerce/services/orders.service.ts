import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CheckoutDto } from '../dto/checkout.dto';
import { CartService } from './cart.service';
import { PaginationQuery } from '../../../common/pipes';
import { OrderFiltersDto } from '../dto/order-filters.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

/**
 * Сервис заказов: формирует заказ из корзины, выдает списки и обновляет статусы.
 */
@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService,
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
