import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CommentTone } from '../../../../generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentTemplateDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    body: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    authorName?: string;

    @ApiPropertyOptional({ minimum: 1, maximum: 5, default: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number = 5;

    @ApiPropertyOptional({ enum: CommentTone, default: CommentTone.POSITIVE })
    @IsOptional()
    @IsEnum(CommentTone)
    tone?: CommentTone = CommentTone.POSITIVE;

    @ApiPropertyOptional({ default: 'ru' })
    @IsOptional()
    @IsString()
    locale?: string = 'ru';
}
