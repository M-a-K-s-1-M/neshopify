import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { TokenService } from '../tokens/token.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService,
        private readonly tokenService: TokenService) { }

    async getAll() {
        return await this.prisma.user.findMany({ omit: { passwordHash: true }, include: { userRoles: { include: { role: true } } } });
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
        });

        const tokens = await this.tokenService.generateTokens({ ...user })
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
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
