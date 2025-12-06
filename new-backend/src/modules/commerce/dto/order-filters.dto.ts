import { IsEnum, IsOptional } from 'class-validator';
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
}
