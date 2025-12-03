import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { AuthService } from "src/modules/auth/auth.service";
import { TokenService } from "src/modules/tokens/token.service";


export class RefreshJwtGuard implements CanActivate {
    constructor(
        private tokenService: TokenService,
        private readonly authService: AuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const refreshToken = request.cookies.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        try {
            const payload = await this.tokenService.validateRefreshToken(refreshToken);
            request.user = payload;
            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}