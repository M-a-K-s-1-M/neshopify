import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltersUsersDto } from './dto/filters-users.dto';
import { PaginationQuery } from '../../common/pipes';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAll(filters: FiltersUsersDto, pagination: PaginationQuery) {
        const { roles, banned, sortBy, order } = filters;
        const { page, limit, search } = pagination;

        const skip = (page - 1) * limit; // Offset для нормализованной пагинации

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

        const orderByField = sortBy || 'createdAt';
        const orderDirection = (order || 'desc') as 'asc' | 'desc'; // Значение приходит уже провалидированным DTO

        const orderBy = {
            [orderByField]: orderDirection,
        } as Record<string, 'asc' | 'desc'>;

        const users = await this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: { userRoles: { include: { role: true } } },
        });


        return {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
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

        return user;
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
