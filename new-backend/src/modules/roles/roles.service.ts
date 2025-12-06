import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Сервис ролей: предоставляет CRUD-интерфейс к справочнику ролей.
 */
@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    /** Возвращает все роли вместе с привязанными пользователями. */
    async getAll() {
        return this.prisma.role.findMany({ include: { userRoles: { include: { user: true } } } });
    }

    /** Создает новую роль. */
    async create(value: string, description: string) {
        return this.prisma.role.create({
            data: {
                value,
                description,
            }
        });
    }

    /** Возвращает роль по значению, выбрасывая исключение при отсутствии. */
    async getByValue(value: string) {
        const role = await this.prisma.role.findUnique({ where: { value }, include: { userRoles: { include: { user: true } } } });
        if (!role) throw new Error(`Role with value ${value} not found`);
        return role;
    }

    /** Удаляет роль по значению. */
    async deleteByValue(value: string) {
        return this.prisma.role.delete({ where: { value } });
    }
}
