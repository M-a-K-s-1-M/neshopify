import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { StorefrontOrdersController } from './controllers/storefront-orders.controller';
import { CartService } from './services/cart.service';
import { OrdersService } from './services/orders.service';
import { PaymentsService } from './services/payments.service';
import { StripeService } from './services/stripe.service';
import { SiteAccessGuard } from '../../common/guards';

@Module({
    controllers: [
        CartController,
        OrdersController,
        StripeWebhookController,
        PaymentsWebhookController,
        StorefrontOrdersController,
    ],
    providers: [CartService, OrdersService, PaymentsService, StripeService, SiteAccessGuard],
})
export class CommerceModule { }
