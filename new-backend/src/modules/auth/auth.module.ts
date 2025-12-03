import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from '../tokens/token.module';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RefreshJwtGuard } from 'src/common/guards/refresh-jwt.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    TokenModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    RefreshJwtGuard,
  ],
})
export class AuthModule { }
