import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductMediaDto {
    @ApiProperty({ format: 'uri', description: 'Ссылка на изображение или видео' })
    @IsUrl()
    url: string;

    @ApiPropertyOptional({ maxLength: 140 })
    @IsOptional()
    @IsString()
    @MaxLength(140)
    alt?: string;

    @ApiPropertyOptional({ minimum: 0, description: 'Позиция для сортировки' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    order?: number;
}
