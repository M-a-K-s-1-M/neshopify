import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltersUsersDto } from './dto/filters-users.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAll(filters: FiltersUsersDto) {
        const { search, roles, banned, page, limit, sortBy, order } = filters;

        const pageNum = Number(page) || 1;
        const take = Number(limit) || 20;

        const skip = (pageNum - 1) * take;

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (banned !== undefined) {
            where.banned = banned === 'true' ? true : false;
        }

        if (roles?.length) {
            where.userRoles = {
                some: {
                    role: {
                        value: { in: roles }
                    }
                }
            }
        }

        const total = await this.prisma.user.count({ where });

        const users = await this.prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: {
                [sortBy || 'createdAt']: order || 'desc'
            },
            include: { userRoles: { include: { role: true } } },
        });


        return {
            page: pageNum,
            limit: take,
            total,
            pages: Math.ceil(total / take),
            users,
        }
    }

    async create(dto: CreateUserDto) {
        const { email, password, roles } = dto;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
                userRoles: {
                    create: roles.map(roleValue => ({
                        role: {
                            connect: { value: roleValue }
                        }
                    }))
                }
            },
            include: { userRoles: { include: { role: true } } }
        })

        return { user };
    }

    async getByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
    }

    async getById(id: string) {
        return await this.prisma.user.findUnique({
            where: { id },
            include: { userRoles: { include: { role: true } } }
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const data: any = {
            email: dto.email,
        };

        if (dto.roles) {
            await this.prisma.userRole.deleteMany({
                where: { userId: id }
            })

            data.userRoles = {
                create: dto.roles.map(roleValue => ({
                    role: { connect: { value: roleValue } }
                }))
            }
        }

        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data,
            include: { userRoles: { include: { role: true } } },
        });
    }

    async ban(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { banned: true },
            include: { userRoles: { include: { role: true } } },
        });
    }

    async unban(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { banned: false },
            include: { userRoles: { include: { role: true } } },
        });
    }

    async deleteById(id: string) {
        return await this.prisma.user.delete({
            where: { id },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
    }
}
