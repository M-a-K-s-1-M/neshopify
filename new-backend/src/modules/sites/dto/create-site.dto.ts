import { IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
    @ApiProperty({ maxLength: 120 })
    @IsString({ message: 'Название сайта обязательно' })
    @MaxLength(120, { message: 'Название не должно превышать 120 символов' })
    name: string;

    @ApiProperty({ description: 'ЧПУ-идентификатор сайта', pattern: '^[a-z0-9-]+$' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'slug может содержать строчные латинские символы, цифры и дефисы' })
    slug: string;

    @ApiPropertyOptional({ description: 'Домен без протокола', example: 'myshop.ru' })
    @IsOptional()
    @Matches(/^[a-z0-9.-]+$/i, { message: 'Домен должен быть без протокола и пробелов' })
    domain?: string;

    @ApiPropertyOptional({ type: Object, description: 'Тема оформления' })
    @IsOptional()
    @IsObject({ message: 'theme должен быть объектом' })
    theme?: Record<string, any>;

    @ApiPropertyOptional({ type: Object, description: 'SEO настройки' })
    @IsOptional()
    @IsObject({ message: 'seo должен быть объектом' })
    seo?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Тарифный план' })
    @IsOptional()
    @IsString()
    plan?: string;
}
