import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMeDto {
    @ApiPropertyOptional({ example: "customer@example.com" })
    @IsOptional()
    @IsEmail({}, { message: "Неверный формат email" })
    email?: string;

    /**
     * @deprecated Для обратной совместимости со старым клиентом.
     * Используйте пару currentPassword/newPassword.
     */
    @ApiPropertyOptional({ minLength: 6, description: "DEPRECATED: новый пароль" })
    @IsOptional()
    @IsString({ message: "Должно быть строкой" })
    @MinLength(6, { message: "Пароль должен содержать минимум 6 символов" })
    password?: string;

    @ApiPropertyOptional({ minLength: 6, description: "Текущий пароль (для смены пароля)" })
    @IsOptional()
    @IsString({ message: "Должно быть строкой" })
    @MinLength(6, { message: "Пароль должен содержать минимум 6 символов" })
    currentPassword?: string;

    @ApiPropertyOptional({ minLength: 6, description: "Новый пароль" })
    @IsOptional()
    @IsString({ message: "Должно быть строкой" })
    @MinLength(6, { message: "Пароль должен содержать минимум 6 символов" })
    newPassword?: string;
}
