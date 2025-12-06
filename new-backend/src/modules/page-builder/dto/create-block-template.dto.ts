import { IsEnum, IsObject, IsOptional, IsString, MaxLength, Matches, IsUrl } from 'class-validator';
import { BlockCategory } from '../../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlockTemplateDto {
    @ApiProperty({ description: 'Уникальный ключ шаблона', pattern: '^[a-z0-9-]+$' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    key: string;

    @ApiProperty({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    title: string;

    @ApiPropertyOptional({ maxLength: 400 })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: BlockCategory, default: BlockCategory.GENERAL })
    @IsOptional()
    @IsEnum(BlockCategory)
    category?: BlockCategory = BlockCategory.GENERAL;

    @ApiPropertyOptional({ type: Object, description: 'JSON-схема данных блока' })
    @IsOptional()
    @IsObject()
    schema?: Record<string, any>;

    @ApiPropertyOptional({ description: 'URL превью', format: 'uri' })
    @IsOptional()
    @IsUrl()
    previewUrl?: string;
}
