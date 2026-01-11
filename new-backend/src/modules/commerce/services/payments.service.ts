import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';

/**
 * Сервис платежей, принимающий уведомления от провайдеров и обновляющий заказы.
 */
@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Обрабатывает вебхук, синхронизирует статусы заказа и сохраняет детали транзакции. */
    async handleWebhook(provider: string, dto: PaymentWebhookDto) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });

        if (!order) {
            throw new NotFoundException('Заказ не найден');
        }

        const paymentStatus = dto.paymentStatus ?? PaymentStatus.PAID;

        const data: Record<string, any> = {
            paymentStatus,
        };

        if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
            data.status = OrderStatus.CONFIRMED;
        }

        if (dto.transactionId) {
            data.paymentDetails = {
                provider,
                transactionId: dto.transactionId,
                payload: dto.rawPayload,
            };
        }

        await this.prisma.order.update({
            where: { id: order.id },
            data,
        });

        return { received: true };
    }
}
