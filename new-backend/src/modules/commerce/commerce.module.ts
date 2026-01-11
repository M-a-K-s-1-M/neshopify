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
    controllers: [CartController, OrdersController, PaymentsWebhookController, StripeWebhookController],
    providers: [CartService, OrdersService, PaymentsService, StripeService, SiteAccessGuard],
})
export class CommerceModule { }
