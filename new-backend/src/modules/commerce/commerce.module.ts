import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { CartService } from './services/cart.service';
import { OrdersService } from './services/orders.service';
import { PaymentsService } from './services/payments.service';
import { StripeService } from './services/stripe.service';
import { SiteAccessGuard } from '../../common/guards';

@Module({
    // Важно: Stripe webhook имеет конкретный маршрут /payments/webhooks/stripe.
    // Его нужно зарегистрировать раньше, чем общий /payments/webhooks/:provider,
    // иначе "stripe" может матчиться как :provider и падать на валидации dto.
    controllers: [CartController, OrdersController, StripeWebhookController, PaymentsWebhookController],
    providers: [CartService, OrdersService, PaymentsService, StripeService, SiteAccessGuard],
})
export class CommerceModule { }
