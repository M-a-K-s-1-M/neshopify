import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartContextDto {
    @ApiProperty({ description: 'Сессионный идентификатор покупателя' })
    @IsString()
    sessionId: string;
}
