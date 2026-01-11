import { Controller, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaymentStatus } from '../../../../generated/prisma/client';
import { ReceivedResponseDto } from 'src/common/swagger/api-models';
import { StripeService } from '../services/stripe.service';
import { PaymentsService } from '../services/payments.service';

@Controller('payments/webhooks/stripe')
@ApiTags('Payments')
export class StripeWebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly paymentsService: PaymentsService,
    ) { }

    @Post()
    @ApiOkResponse({ type: ReceivedResponseDto })
    async handleStripe(@Req() req: RawBodyRequest<Request>) {
        const event = this.stripeService.constructEvent(
            req.rawBody as Buffer,
            req.headers['stripe-signature'],
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const orderId = session?.metadata?.orderId ?? session?.client_reference_id;
            const transactionId = typeof session?.payment_intent === 'string' ? session.payment_intent : undefined;

            if (orderId) {
                return this.paymentsService.handleWebhook('stripe', {
                    orderId,
                    transactionId,
                    paymentStatus: PaymentStatus.PAID,
                    rawPayload: session,
                });
            }
        }

        return { received: true };
    }
}
