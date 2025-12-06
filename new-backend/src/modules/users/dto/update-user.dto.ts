import { IsArray, IsEmail, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example: 'user@site.com' })
    @IsEmail({}, { message: 'Неверный формат email' })
    readonly email: string;

    @ApiPropertyOptional({ minLength: 6, maxLength: 20 })
    @IsOptional()
    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 20, { message: 'Пароль должен быть от 6 до 20 символов' })
    readonly password?: string;

    @ApiProperty({ type: [String], description: 'Набор ролей' })
    @IsArray({ message: 'Роли должны быть массивом' })
    readonly roles: string[];
}