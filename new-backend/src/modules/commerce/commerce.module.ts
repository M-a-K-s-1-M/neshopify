import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';
import { CartService } from './services/cart.service';
import { OrdersService } from './services/orders.service';
import { PaymentsService } from './services/payments.service';
import { SiteAccessGuard } from '../../common/guards';

@Module({
    controllers: [CartController, OrdersController, PaymentsWebhookController],
    providers: [CartService, OrdersService, PaymentsService, SiteAccessGuard],
})
export class CommerceModule { }
