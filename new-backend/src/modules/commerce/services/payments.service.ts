import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, StockStatus } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';

function mergePaymentDetails(existing: unknown, patch: Record<string, unknown>) {
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        return { ...(existing as Record<string, unknown>), ...patch };
    }
    return patch;
}

/**
 * Сервис платежей, принимающий уведомления от провайдеров и обновляющий заказы.
 */
@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Обрабатывает вебхук, синхронизирует статусы заказа и сохраняет детали транзакции. */
    async handleWebhook(provider: string, dto: PaymentWebhookDto) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: dto.orderId },
                include: { items: true },
            });

            if (!order) {
                throw new NotFoundException('Заказ не найден');
            }

            const paymentStatus = dto.paymentStatus ?? PaymentStatus.PAID;
            const shouldApplyStockDecrement =
                paymentStatus === PaymentStatus.PAID && order.paymentStatus !== PaymentStatus.PAID;

            const data: Record<string, any> = {
                paymentStatus,
            };

            if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
                data.status = OrderStatus.CONFIRMED;
            }

            if (dto.transactionId) {
                data.paymentDetails = mergePaymentDetails(order.paymentDetails, {
                    provider,
                    transactionId: dto.transactionId,
                    payload: dto.rawPayload,
                });
            }

            await tx.order.update({
                where: { id: order.id },
                data,
            });

            if (shouldApplyStockDecrement) {
                for (const item of order.items) {
                    const qty = Number(item.quantity) || 0;
                    if (qty <= 0) continue;

                    // PREORDER не списываем со склада
                    const updated = await tx.product.updateMany({
                        where: {
                            id: item.productId,
                            siteId: order.siteId,
                            stockStatus: { not: StockStatus.PREORDER },
                            stock: { gte: qty },
                        },
                        data: {
                            stock: { decrement: qty },
                        },
                    });

                    if (updated.count === 0) {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                            select: { stockStatus: true, stock: true },
                        });

                        if (!product) {
                            continue;
                        }

                        if (product.stockStatus === StockStatus.PREORDER) {
                            continue;
                        }

                        throw new BadRequestException(
                            `Недостаточно товара на складе для позиции "${item.title}" (доступно: ${product.stock})`,
                        );
                    }

                    await tx.product.updateMany({
                        where: {
                            id: item.productId,
                            siteId: order.siteId,
                            stock: { lte: 0 },
                        },
                        data: {
                            stockStatus: StockStatus.OUT_OF_STOCK,
                        },
                    });
                }
            }

            return { received: true };
        });
    }
}
