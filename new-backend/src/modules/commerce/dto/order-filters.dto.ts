import { IsEnum, IsNumberString, IsOptional, IsISO8601 } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OrderFiltersDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Минимальная сумма заказа (в основной валюте), число строкой' })
    @IsOptional()
    @IsNumberString()
    minTotal?: string;

    @ApiPropertyOptional({ description: 'Максимальная сумма заказа (в основной валюте), число строкой' })
    @IsOptional()
    @IsNumberString()
    maxTotal?: string;

    @ApiPropertyOptional({ description: 'Дата заказа от (ISO строка или YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    dateFrom?: string;

    @ApiPropertyOptional({ description: 'Дата заказа до (ISO строка или YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    dateTo?: string;
}
