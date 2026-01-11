import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { CheckoutDto } from './checkout.dto';

export class StripeCheckoutDto extends CheckoutDto {
    @ApiProperty({ description: 'Полный URL, куда Stripe вернет пользователя при успешной оплате' })
    @IsString()
    @IsUrl({ require_tld: false })
    successUrl: string;

    @ApiProperty({ description: 'Полный URL, куда Stripe вернет пользователя при отмене оплаты' })
    @IsString()
    @IsUrl({ require_tld: false })
    cancelUrl: string;
}
