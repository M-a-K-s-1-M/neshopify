import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../tokens/token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private tokenService: TokenService,
        private prisma: PrismaService,
        private usersService: UsersService) { }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
            omit: { passwordHash: false }
        });
        if (!user) throw new UnauthorizedException('Пользователя с таким email не существует');

        const comparePasswords = await bcrypt.compare(password, user.passwordHash);
        if (!comparePasswords) throw new UnauthorizedException('Неверный пароль');

        const tokens = await this.tokenService.generateTokens({ ...user })

        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    // ADMIN, SITE_OWNER, CUSTOMER  
    async ragistration(email: string, password: string) {
        const candidate = await this.prisma.user.findUnique({ where: { email } });
        if (candidate) throw new BadRequestException('Пользователь с таким email уже существует');

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                userRoles: {
                    create: {
                        role: {
                            connect: { value: 'SITE_OWNER' }
                        }
                    }
                }
            },
            include: {
                userRoles:
                    { include: { role: true } }
            },
        })

        const tokens = await this.tokenService.generateTokens({ ...user })
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    async logout(refreshToken: string) {
        const token = await this.tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(oldRefreshToken: string) {

        // const token = await this.tokenService.removeToken(oldRefreshToken);

        // let userData;
        // try {
        //     userData = await this.tokenService.validateRefreshToken(oldRefreshToken);

        // } catch (e) {
        //     throw new UnauthorizedException('Пользователь не авторизован');
        // }

        // if (!token) {
        //     throw new UnauthorizedException('Пользователь не авторизован');
        // }

        // const user = await this.usersService.getById(token.userId);

        // const tokens = await this.tokenService.generateTokens(user)

        // return { ...tokens, user };

        let userData;
        try {
            userData = await this.tokenService.validateRefreshToken(oldRefreshToken);

        } catch (e) {
            throw new UnauthorizedException('Пользователь не авторизован');
        }

        const refreshTokenFromDb = await this.prisma.token.findUnique({ where: { refreshToken: oldRefreshToken } });

        if (!userData || !refreshTokenFromDb) {
            throw new UnauthorizedException('Пользователь не авторизован');
        }

        const user = await this.prisma.user.findUnique({ where: { id: userData.id }, include: { userRoles: { include: { role: true } } } });
        if (!user) {
            throw new UnauthorizedException('Пользователь не авторизован');
        }
        const tokens = await this.tokenService.generateTokens({ ...user })
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    async loginAdmin(email: string, password: string) {
        const adminCandidate = await this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } },
            omit: { passwordHash: false }
        })

        if (!adminCandidate) throw new UnauthorizedException('Администратора с таким email не существует');


        if (!adminCandidate.userRoles.some(userRole => userRole.role.value === 'ADMIN')) throw new UnauthorizedException('Недостаточно прав, требуется роль ADMIN');

        const comparePasswords = await bcrypt.compare(password, adminCandidate.passwordHash);

        if (!comparePasswords) throw new UnauthorizedException('Неверный пароль');

        const user = await this.usersService.getByEmail(email);

        if (!user) throw new UnauthorizedException()

        const tokens = await this.tokenService.generateTokens({ ...user })

        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            omit: { passwordHash: false }
        });
        if (user) {
            const passwordValid = await bcrypt.compare(password, user.passwordHash);

            if (passwordValid) {
                return user;
            }
        }

        throw new UnauthorizedException('Пользователя с таким email не существует');
    }
}
