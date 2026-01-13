import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { PaginationPipe } from '../../../common/pipes';
import type { PaginationQuery } from '../../../common/pipes';
import { OrderFiltersDto } from '../dto/order-filters.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from 'src/common/swagger/api-models';
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response.decorator';

/**
 * Закрытый контроллер управления заказами для владельцев сайтов.
 */
@Controller('sites/:siteId/orders')
@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /** Возвращает страницу заказов по фильтрам и поиску. */
    @Get()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiPaginatedResponse(OrderResponseDto)
    list(
        @Param('siteId') siteId: string,
        @Query(new PaginationPipe({ defaultLimit: 20, maxLimit: 100 })) pagination: PaginationQuery,
        @Query() filters: OrderFiltersDto,
        @Query('includeItems') includeItems?: string,
        @Query('totalSort') totalSort?: 'asc' | 'desc',
    ) {
        const includeItemsBool = includeItems === undefined ? true : includeItems !== 'false';
        return this.ordersService.list(siteId, pagination, filters, includeItemsBool, totalSort);
    }

    /** Загружает один заказ по идентификатору. */
    @Get(':orderId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: OrderResponseDto })
    get(@Param('siteId') siteId: string, @Param('orderId') orderId: string) {
        return this.ordersService.get(siteId, orderId);
    }

    /** Обновляет статусы заказа (доставка/оплата). */
    @Patch(':orderId/status')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: OrderResponseDto })
    updateStatus(
        @Param('siteId') siteId: string,
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(siteId, orderId, dto);
    }
}
