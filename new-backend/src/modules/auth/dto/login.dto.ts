import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Неверный формат email' })
    email: string;

    @ApiProperty({ minLength: 6 })
    @IsString({ message: 'Должно быть строкой' })
    password: string;
}