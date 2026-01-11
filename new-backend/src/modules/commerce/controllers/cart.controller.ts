import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartContextDto } from '../dto/cart-context.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { StripeCheckoutDto } from '../dto/stripe-checkout.dto';
import { StripeCheckoutResponseDto } from '../dto/stripe-checkout-response.dto';
import { OrdersService } from '../services/orders.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartResponseDto, OrderResponseDto } from 'src/common/swagger/api-models';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SiteAccess } from '../../../common/decorators/site-access.decorator';
import { SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';

/**
 * Контроллер корзины, который доступен из публичного магазина и
 * проксирует операции к CartService и OrdersService.
 */
@Controller('sites/:siteId/cart')
@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SiteAccessGuard)
@Roles('CUSTOMER')
@SiteAccess(SiteAccessRequirement.MEMBER)
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly ordersService: OrdersService,
    ) { }

    /** Возвращает текущую корзину по siteId и sessionId. */
    @Get()
    @ApiOkResponse({ type: CartResponseDto })
    getCart(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Query() query: CartContextDto,
    ) {
        return this.cartService.getCart(siteId, { sessionId: query.sessionId, userId: req.user?.sub });
    }

    /** Добавляет товар в корзину или увеличивает его количество. */
    @Post('items')
    @ApiOkResponse({ type: CartResponseDto })
    addItem(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Body() dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(siteId, dto, req.user?.sub);
    }

    /** Изменяет параметры существующей позиции корзины. */
    @Patch('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    updateItem(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(siteId, itemId, dto, req.user?.sub);
    }

    /** Удаляет конкретную позицию корзины. */
    @Delete('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    removeItem(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Query() query: CartContextDto,
    ) {
        return this.cartService.removeItem(siteId, itemId, { sessionId: query.sessionId, userId: req.user?.sub });
    }

    /** Полностью очищает корзину пользователя. */
    @Delete()
    @ApiOkResponse({ type: CartResponseDto })
    clear(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Query() query: CartContextDto,
    ) {
        return this.cartService.clearCart(siteId, { sessionId: query.sessionId, userId: req.user?.sub });
    }

    /** Создает заказ на основе текущей корзины. */
    @Post('checkout')
    @ApiCreatedResponse({ type: OrderResponseDto })
    checkout(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Body() dto: CheckoutDto,
    ) {
        return this.ordersService.checkout(siteId, dto, req.user?.sub);
    }

    /** Создает Stripe Checkout сессию на основе текущей корзины. */
    @Post('checkout/stripe')
    @ApiCreatedResponse({ type: StripeCheckoutResponseDto })
    checkoutStripe(
        @Req() req: Request & { user?: any },
        @Param('siteId') siteId: string,
        @Body() dto: StripeCheckoutDto,
    ) {
        return this.ordersService.checkoutStripe(siteId, dto, req.user?.sub);
    }
}
