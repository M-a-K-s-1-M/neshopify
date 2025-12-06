import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartContextDto } from '../dto/cart-context.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrdersService } from '../services/orders.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartResponseDto, OrderResponseDto } from 'src/common/swagger/api-models';

/**
 * Контроллер корзины, который доступен из публичного магазина и
 * проксирует операции к CartService и OrdersService.
 */
@Controller('sites/:siteId/cart')
@ApiTags('Cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly ordersService: OrdersService,
    ) { }

    /** Возвращает текущую корзину по siteId и sessionId. */
    @Get()
    @ApiOkResponse({ type: CartResponseDto })
    getCart(@Param('siteId') siteId: string, @Query() query: CartContextDto) {
        return this.cartService.getCart(siteId, query.sessionId);
    }

    /** Добавляет товар в корзину или увеличивает его количество. */
    @Post('items')
    @ApiOkResponse({ type: CartResponseDto })
    addItem(@Param('siteId') siteId: string, @Body() dto: AddCartItemDto) {
        return this.cartService.addItem(siteId, dto);
    }

    /** Изменяет параметры существующей позиции корзины. */
    @Patch('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    updateItem(
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(siteId, itemId, dto);
    }

    /** Удаляет конкретную позицию корзины. */
    @Delete('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    removeItem(
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Query() query: CartContextDto,
    ) {
        return this.cartService.removeItem(siteId, itemId, query.sessionId);
    }

    /** Полностью очищает корзину пользователя. */
    @Delete()
    @ApiOkResponse({ type: CartResponseDto })
    clear(@Param('siteId') siteId: string, @Query() query: CartContextDto) {
        return this.cartService.clearCart(siteId, query.sessionId);
    }

    /** Создает заказ на основе текущей корзины. */
    @Post('checkout')
    @ApiCreatedResponse({ type: OrderResponseDto })
    checkout(@Param('siteId') siteId: string, @Body() dto: CheckoutDto) {
        return this.ordersService.checkout(siteId, dto);
    }
}
