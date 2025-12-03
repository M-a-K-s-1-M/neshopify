import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Неверный формат email' })
    email: string;

    @IsString({ message: 'Должно быть строкой' })
    password: string;
}