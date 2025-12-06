import { IsOptional, IsString, Matches, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    name: string;

    @ApiProperty({ pattern: '^[a-z0-9-]+$', description: 'Уникальный slug категории' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug: string;

    @ApiPropertyOptional({ format: 'uuid', description: 'Родительская категория' })
    @IsOptional()
    @IsUUID()
    parentId?: string;
}
