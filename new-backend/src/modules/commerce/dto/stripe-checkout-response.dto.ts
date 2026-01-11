import { ApiProperty } from '@nestjs/swagger';

export class StripeCheckoutResponseDto {
    @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_...' })
    checkoutUrl: string;
}
