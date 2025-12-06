import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { StockStatus } from '../../../../generated/prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductFiltersDto {
    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ enum: StockStatus })
    @IsOptional()
    @IsEnum(StockStatus)
    stockStatus?: StockStatus;

    @ApiPropertyOptional({ type: Number, description: 'Мин. цена', example: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    priceMin?: number;

    @ApiPropertyOptional({ type: Number, description: 'Макс. цена', example: 9999 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    priceMax?: number;

    @ApiPropertyOptional({ type: Boolean, description: 'Только товары в наличии' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        return value === 'true' || value === '1';
    })
    @IsBoolean()
    inStock?: boolean;
}
