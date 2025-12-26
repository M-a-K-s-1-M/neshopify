import {
    BadRequestException,
    Controller,
    Headers,
    Post,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import { ReceivedResponseDto } from 'src/common/swagger/api-models';
import { PaymentsService } from '../services/payments.service';
import { StripeService } from '../services/stripe.service';
import { PaymentStatus } from '../../../../generated/prisma/client';

@Controller('payments/webhooks/stripe')
@ApiTags('Payments')
export class StripeWebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly paymentsService: PaymentsService,
    ) { }

    @Post()
    @ApiOkResponse({ type: ReceivedResponseDto })
    async handle(
        @Req() req: Request & { body: Buffer },
        @Headers('stripe-signature') signature: string | undefined,
    ) {
        const rawBody = req.body;
        if (!Buffer.isBuffer(rawBody)) {
            throw new BadRequestException('Stripe webhook ожидает raw body (Buffer)');
        }

        const event = this.stripeService.constructEvent(rawBody, signature);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (!orderId) {
                throw new BadRequestException('Stripe session не содержит metadata.orderId');
            }

            await this.paymentsService.handleWebhook('stripe', {
                orderId,
                paymentStatus: PaymentStatus.PAID,
                transactionId: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
                rawPayload: event as any,
            });

            return { received: true };
        }

        if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            if (orderId) {
                await this.paymentsService.handleWebhook('stripe', {
                    orderId,
                    paymentStatus: PaymentStatus.NOT_PAID,
                    transactionId: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
                    rawPayload: event as any,
                });
            }
            return { received: true };
        }

        // Остальные события пока игнорируем (но подтверждаем получение).
        return { received: true };
    }
}
