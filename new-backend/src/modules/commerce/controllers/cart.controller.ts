import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartContextDto } from '../dto/cart-context.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrdersService } from '../services/orders.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartResponseDto, OrderResponseDto } from 'src/common/swagger/api-models';

@Controller('sites/:siteId/cart')
@ApiTags('Cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly ordersService: OrdersService,
    ) { }

    @Get()
    @ApiOkResponse({ type: CartResponseDto })
    getCart(@Param('siteId') siteId: string, @Query() query: CartContextDto) {
        return this.cartService.getCart(siteId, query.sessionId);
    }

    @Post('items')
    @ApiOkResponse({ type: CartResponseDto })
    addItem(@Param('siteId') siteId: string, @Body() dto: AddCartItemDto) {
        return this.cartService.addItem(siteId, dto);
    }

    @Patch('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    updateItem(
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(siteId, itemId, dto);
    }

    @Delete('items/:itemId')
    @ApiOkResponse({ type: CartResponseDto })
    removeItem(
        @Param('siteId') siteId: string,
        @Param('itemId') itemId: string,
        @Query() query: CartContextDto,
    ) {
        return this.cartService.removeItem(siteId, itemId, query.sessionId);
    }

    @Delete()
    @ApiOkResponse({ type: CartResponseDto })
    clear(@Param('siteId') siteId: string, @Query() query: CartContextDto) {
        return this.cartService.clearCart(siteId, query.sessionId);
    }

    @Post('checkout')
    @ApiCreatedResponse({ type: OrderResponseDto })
    checkout(@Param('siteId') siteId: string, @Body() dto: CheckoutDto) {
        return this.ordersService.checkout(siteId, dto);
    }
}
