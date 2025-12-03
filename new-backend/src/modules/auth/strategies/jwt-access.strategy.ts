import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not defined");
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req.cookies?.accessToken,
            ]),
            secretOrKey: secret, // Теперь гарантированно string
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}