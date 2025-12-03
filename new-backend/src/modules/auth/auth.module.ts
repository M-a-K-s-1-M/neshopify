import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})

export class AuthModule { }