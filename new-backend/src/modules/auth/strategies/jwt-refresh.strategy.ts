import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    "jwt-refresh"
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req.cookies?.refreshToken,
            ]),
            secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
            passReqToCallback: true,
        });
    }

    validate(req: any, payload: JwtPayload) { // Типизируйте req и payload
        const token = req.cookies?.refreshToken;
        if (!token) throw new UnauthorizedException();
        return payload;
    }
}