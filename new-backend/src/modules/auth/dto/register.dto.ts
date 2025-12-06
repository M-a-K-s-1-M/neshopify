import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'owner@example.com' })
    @IsEmail({}, { message: 'Неверный формат email' })
    email: string;

    @ApiProperty({ minLength: 6 })
    @IsString({ message: 'Должно быть строкой' })
    @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
    password: string;
}