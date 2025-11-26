import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>[]> {
        return await this.prisma.user.findMany({ include: { roles: true } });
    }

    async create(dto: CreateUserDto): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>> {
        const { email, password, roles } = dto;
        const passwordHash = await bcrypt.hash(password, 10);
        return await this.prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
                roles: {
                    connect: roles.map(role => ({ value: role }))
                }
            },
            include: { roles: true }
        });
    }

    async getByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { email } });
    }
}
