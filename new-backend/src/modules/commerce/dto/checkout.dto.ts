import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { CartContextDto } from './cart-context.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto extends CartContextDto {
    @ApiProperty({ format: 'email' })
    @IsEmail()
    customerEmail: string;

    @ApiPropertyOptional({ format: 'phone' })
    @IsOptional()
    @IsPhoneNumber('RU')
    customerPhone?: string;

    @ApiPropertyOptional({ description: 'Адрес доставки' })
    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @ApiPropertyOptional({ description: 'Комментарий покупателя' })
    @IsOptional()
    @IsString()
    notes?: string;
}
