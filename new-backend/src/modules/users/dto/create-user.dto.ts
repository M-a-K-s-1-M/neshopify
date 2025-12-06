import { IsArray, IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {

    @ApiProperty({ example: 'admin@example.com' })
    @IsString({ message: 'Email должен быть строкой' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    readonly email: string;

    @ApiProperty({ minLength: 6, maxLength: 20 })
    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 20, { message: 'Пароль должен быть от 6 до 20 символов' })
    readonly password: string;

    @ApiProperty({ type: [String], description: 'Роли пользователя' })
    @IsArray({ message: 'Роли должны быть массивом строк' })
    readonly roles: string[];
}