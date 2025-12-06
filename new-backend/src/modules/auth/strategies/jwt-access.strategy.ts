import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly configService: ConfigService) {
        const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req.cookies?.accessToken,
                bearerExtractor,
            ]),
            secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}