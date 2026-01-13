import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guards';
import { OrdersService } from '../services/orders.service';

/**
 * Публичный (storefront) контроллер заказов для покупателей.
 * Возвращает только заказы текущего пользователя.
 */
@Controller('storefront/sites/:siteId/orders')
@ApiTags('Storefront Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StorefrontOrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /** Возвращает оплаченные заказы текущего пользователя для выбранного сайта. */
    @Get('my')
    @ApiOkResponse({ description: 'Список оплаченных заказов текущего пользователя' })
    listMyPaid(@Param('siteId') siteId: string, @Req() req: Request) {
        const user = req.user as { sub: string } | undefined;
        return this.ordersService.listMyPaid(siteId, user?.sub);
    }
}
