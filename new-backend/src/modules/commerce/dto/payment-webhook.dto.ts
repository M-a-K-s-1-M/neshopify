import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentWebhookDto {
    @ApiProperty({ description: 'ID заказа, для которого пришел webhook' })
    @IsString()
    orderId: string;

    @ApiPropertyOptional({ description: 'ID транзакции у платежного провайдера' })
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({ type: Object, description: 'Сырой payload от провайдера' })
    @IsOptional()
    rawPayload?: Record<string, any>;
}
