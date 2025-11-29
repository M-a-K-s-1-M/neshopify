import { IsArray, IsEmail, IsString, Length } from 'class-validator';
export class CreateUserDto {

    @IsString({ message: 'Email должен быть строкой' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    readonly email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 20, { message: 'Пароль должен быть от 6 до 20 символов' })
    readonly password: string;

    @IsArray({ message: 'Роли должны быть массивом строк' })
    readonly roles: string[];
}