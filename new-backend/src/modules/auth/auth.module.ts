import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const accessTtl: StringValue = config.get<StringValue>('jwt.accessTtl') ?? '15m';

        return {
          secret: config.getOrThrow<string>('jwt.accessSecret'),
          signOptions: {
            expiresIn: accessTtl,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})

export class AuthModule { }