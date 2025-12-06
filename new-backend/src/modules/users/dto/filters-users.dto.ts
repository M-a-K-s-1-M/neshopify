import { Transform } from 'class-transformer';
import { IsArray, IsBooleanString, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltersUsersDto {

    @ApiPropertyOptional({ description: 'Поиск по email' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ type: [String], description: 'Набор глобальных ролей' })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;  // уже массив — вернуть как есть
        return value.split(',');
    })
    @IsArray()
    roles?: string[];

    @ApiPropertyOptional({ description: 'Фильтр по бану: true/false' })
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsBooleanString()
    banned?: string;

    @ApiPropertyOptional({ description: 'Поле сортировки', example: 'createdAt' })
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Направление сортировки' })
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase()) // Приводим направление сортировки к предсказуемому виду
    @IsIn(['asc', 'desc'], { message: 'order must be asc or desc' })
    order?: 'asc' | 'desc';
}