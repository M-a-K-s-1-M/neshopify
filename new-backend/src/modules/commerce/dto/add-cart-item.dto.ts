import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';
import { CartContextDto } from './cart-context.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto extends CartContextDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    productId: string;

    @ApiProperty({ minimum: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;
}
