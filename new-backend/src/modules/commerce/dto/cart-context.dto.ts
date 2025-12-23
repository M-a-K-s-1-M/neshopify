import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CartContextDto {
    @ApiPropertyOptional({ description: 'Сессионный идентификатор покупателя (для гостя)' })
    @IsOptional()
    @IsString()
    sessionId?: string;
}
