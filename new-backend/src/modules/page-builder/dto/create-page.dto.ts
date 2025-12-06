import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PageType } from '../../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
    @ApiProperty({ maxLength: 120, description: 'Название страницы' })
    @IsString()
    @MaxLength(120)
    title: string;

    @ApiProperty({ description: 'Slug страницы', example: 'landing', pattern: '^[a-z0-9-]+$' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'slug может содержать строчные латинские символы, цифры и дефисы' })
    slug: string;

    @ApiPropertyOptional({ enum: PageType, default: PageType.CUSTOM })
    @IsOptional()
    @IsEnum(PageType)
    type?: PageType = PageType.CUSTOM;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean = true;

    @ApiPropertyOptional({ type: Object })
    @IsOptional()
    @IsObject()
    seo?: Record<string, any>;
}
