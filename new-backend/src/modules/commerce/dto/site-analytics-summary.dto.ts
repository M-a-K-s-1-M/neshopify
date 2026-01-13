import { ApiProperty } from '@nestjs/swagger';

export class SiteAnalyticsSummaryResponseDto {
    @ApiProperty({ description: 'Сумма оплаченных заказов', example: '847392.00' })
    totalSales: string;

    @ApiProperty({ description: 'Количество заказов (кроме DRAFT)' })
    ordersCount: number;

    @ApiProperty({ description: 'Количество клиентов (пользователей сайта)' })
    customersCount: number;

    @ApiProperty({ description: 'Конверсия в процентах (0..100)' })
    conversionPercent: number;
}
