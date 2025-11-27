import { IsEmail, IsString, Length } from "class-validator"

export class RegistrationUserDto {

    @IsString({ message: 'Email должен быть строкой' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    readonly email: string

    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 20, { message: 'Пароль должен быть от 6 до 20 символов' })
    readonly password: string;
}