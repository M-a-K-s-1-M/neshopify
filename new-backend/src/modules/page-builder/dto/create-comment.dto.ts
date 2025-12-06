import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiPropertyOptional({ format: 'uuid', description: 'ID шаблона комментария' })
    @IsOptional()
    @IsString()
    templateId?: string;

    @ApiProperty({ description: 'Имя автора, отображаемое в отзыве' })
    @IsString()
    authorName: string;

    @ApiPropertyOptional({ description: 'Ссылка на аватар автора' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({ description: 'Текст отзыва' })
    @IsString()
    body: string;

    @ApiPropertyOptional({ minimum: 1, maximum: 5, default: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number = 5;
}
