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

    async findAll(): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>[]> {
        return await this.prisma.user.findMany({ include: { roles: true } });
    }

    async create(dto: CreateUserDto) {
        const { email, password, roles } = dto;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
                roles: {
                    connect: roles.map(role => ({ value: role }))
                }
            },
            include: { roles: true }
        });

        const tokens = await this.tokenService.generateTokens({ ...user })
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    async getByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { email } });
    }

    async getById(id: string): Promise<Prisma.UserGetPayload<{ include: { roles: true } }> | null> {
        return await this.prisma.user.findUnique({
            where: { id },
            include: { roles: true }
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const data: any = {
            email: dto.email,
            roles: {
                set: dto.roles.map(role => ({ value: role }))
            }
        };

        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data,
            include: { roles: true }
        });
    }
}
