import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMeDto {
    @ApiPropertyOptional({ example: "customer@example.com" })
    @IsOptional()
    @IsEmail({}, { message: "Неверный формат email" })
    email?: string;

    @ApiPropertyOptional({ minLength: 6 })
    @IsOptional()
    @IsString({ message: "Должно быть строкой" })
    @MinLength(6, { message: "Пароль должен содержать минимум 6 символов" })
    password?: string;
}
