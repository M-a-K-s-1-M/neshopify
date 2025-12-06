import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { StockStatus } from '../../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ maxLength: 180 })
    @IsString()
    @MaxLength(180)
    title: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 1990.5 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    price: number;

    @ApiPropertyOptional({ default: 'RUB' })
    @IsOptional()
    @IsString()
    currency?: string = 'RUB';

    @ApiPropertyOptional({ description: 'Артикул' })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({ minimum: 0, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stock?: number = 0;

    @ApiPropertyOptional({ enum: StockStatus, default: StockStatus.IN_STOCK })
    @IsOptional()
    @IsEnum(StockStatus)
    stockStatus?: StockStatus = StockStatus.IN_STOCK;

    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}
