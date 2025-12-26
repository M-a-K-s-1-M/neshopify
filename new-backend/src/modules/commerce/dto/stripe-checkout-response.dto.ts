import { ApiProperty } from '@nestjs/swagger';

export class StripeCheckoutResponseDto {
    @ApiProperty({ format: 'uuid' })
    orderId: string;

    @ApiProperty({ description: 'URL Stripe Checkout, куда нужно редиректнуть пользователя' })
    checkoutUrl: string;
}
