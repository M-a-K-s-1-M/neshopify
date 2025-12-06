import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { CartContextDto } from './cart-context.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto extends CartContextDto {
    @ApiProperty({ minimum: 1, description: 'Новое количество' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;
}
