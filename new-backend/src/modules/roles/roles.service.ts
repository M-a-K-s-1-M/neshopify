import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    // ADMIN, SITE_OWNER, CUSTOMER  
    async getAll() {
        return this.prisma.role.findMany({ include: { userRoles: { include: { user: true } } } });
    }

    async create(value: string, description: string) {
        return this.prisma.role.create({
            data: {
                value,
                description,
            }
        });
    }

    async getByValue(value: string) {
        const role = await this.prisma.role.findUnique({ where: { value }, include: { userRoles: { include: { user: true } } } });
        if (!role) throw new Error(`Role with value ${value} not found`);
        return role;
    }

    async deleteByValue(value: string) {
        return this.prisma.role.delete({ where: { value } });
    }
}
