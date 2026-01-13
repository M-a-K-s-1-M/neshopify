import { ApiProperty } from '@nestjs/swagger';

export class SiteOrdersPointDto {
    @ApiProperty({ description: 'Короткая подпись месяца для оси X (например, Янв)' })
    month: string;

    @ApiProperty({ description: 'Количество заказов за месяц' })
    orders: number;
}

export class SiteOrdersSeriesResponseDto {
    @ApiProperty({ type: () => [SiteOrdersPointDto] })
    data: SiteOrdersPointDto[];

    @ApiProperty({ description: 'Текст для заголовка, например "за декабрь"' })
    currentLabel: string;

    @ApiProperty({ description: 'Количество заказов в текущем (последнем) месяце' })
    currentOrders: number;
}
