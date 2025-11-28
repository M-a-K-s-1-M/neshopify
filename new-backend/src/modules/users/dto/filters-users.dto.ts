import { Transform } from 'class-transformer';
import { IsArray, IsBooleanString, IsOptional, IsString } from 'class-validator';

export class FiltersUsersDto {

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;  // уже массив — вернуть как есть
        return value.split(',');
    })
    @IsArray()
    roles?: string[];

    @IsOptional()
    @IsBooleanString()
    banned?: string;

    @IsOptional()
    page?: string;

    @IsOptional()
    limit?: string;

    @IsOptional()
    sortBy?: string;

    @IsOptional()
    order?: string;
}