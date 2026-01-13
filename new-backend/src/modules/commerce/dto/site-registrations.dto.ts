import { ApiProperty } from '@nestjs/swagger';

export class SiteRegistrationsPointDto {
    @ApiProperty({ description: 'Короткая подпись месяца для оси X (например, Янв)' })
    month: string;

    @ApiProperty({ description: 'Количество регистраций за месяц' })
    users: number;
}

export class SiteRegistrationsResponseDto {
    @ApiProperty({ type: () => [SiteRegistrationsPointDto] })
    data: SiteRegistrationsPointDto[];

    @ApiProperty({ description: 'Текст для заголовка, например "за декабрь"' })
    currentLabel: string;

    @ApiProperty({ description: 'Количество регистраций в текущем (последнем) месяце' })
    currentUsers: number;
}
