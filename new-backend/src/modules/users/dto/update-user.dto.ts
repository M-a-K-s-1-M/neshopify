import { IsArray, IsEmail, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDto {
    @IsEmail({}, { message: 'Неверный формат email' })
    readonly email: string;

    @IsOptional()
    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(6, 20, { message: 'Пароль должен быть от 6 до 20 символов' })
    readonly password?: string;

    @IsArray({ message: 'Роли должны быть массивом' })
    readonly roles: string[];
}