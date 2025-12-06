import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlockDto {
    @ApiPropertyOptional({ format: 'uuid', description: 'ID готового шаблона блока' })
    @ValidateIf((o) => !o.templateKey)
    @IsString()
    templateId?: string;

    @ApiPropertyOptional({ description: 'Ключ зарегистрированного шаблона' })
    @ValidateIf((o) => !o.templateId)
    @IsString()
    templateKey?: string;

    @ApiPropertyOptional({ description: 'Позиция блока в списке', minimum: 1 })
    @IsOptional()
    @IsNumber()
    order?: number;

    @ApiProperty({ type: Object, description: 'Данные блока в соответствии с его схемой' })
    @IsObject()
    data: Record<string, any>;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    pinned?: boolean;
}
