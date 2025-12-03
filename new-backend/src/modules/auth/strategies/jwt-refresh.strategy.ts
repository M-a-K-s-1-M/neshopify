import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    "jwt-refresh"
) {
    constructor() {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET is not defined");
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req.cookies?.refreshToken,
            ]),
            secretOrKey: secret, // Теперь гарантированно string
            passReqToCallback: true,
        });
    }

    validate(req: any, payload: JwtPayload) { // Типизируйте req и payload
        const token = req.cookies?.refreshToken;
        if (!token) throw new UnauthorizedException();
        return payload;
    }
}