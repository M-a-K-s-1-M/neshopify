import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) { }

    async generateTokens(payload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '30d',
        });

        return { accessToken, refreshToken };
    }


    async saveToken(userId: string, refreshToken: string) {
        const token = await this.prisma.token.upsert({
            where: { userId },
            update: { refreshToken },
            create: { userId, refreshToken },
        });
        return token;
    }

    async removeToken(refreshToken: string) {
        const tokenData = await this.prisma.token.delete({
            where: { refreshToken }
        })

        return tokenData;
    }

    async validateAccessToken(token: string) {
        try {
            const userData = await this.jwtService.verifyAsync(token, {
                secret: process.env.ACCESS_TOKEN_SECRET,
            });
            return userData;
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(token: string) {
        try {
            const userData = await this.jwtService.verifyAsync(token, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            });
            return userData;
        } catch (e) {
            return null;
        }
    }

}
