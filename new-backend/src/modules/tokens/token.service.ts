import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) { }

    async generateTokens(payload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
            expiresIn: '15m', // 15 minutes
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
            expiresIn: '30d', // 30 days
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
                secret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
            });
            return userData;
        } catch (e) {
            return null;
        }
    }

    async setRefreshTokenToCookie(refreshToken: string, res: Response) {
        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        interface ICookieOptions {
            httpOnly: boolean;
            sameSite: 'lax' | 'strict' | 'none';
            secure: boolean;
            path: string;
            maxAge: number;
        }

        const cookieName = 'refreshToken';
        const cookieValue = refreshToken;
        const cookieOptions: ICookieOptions = {
            httpOnly: true,
            sameSite: 'none',
            secure: false,
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        }

        res.cookie(cookieName, cookieValue, cookieOptions);
    }

}
