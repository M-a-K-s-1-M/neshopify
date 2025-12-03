import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TokenModule } from '../tokens/token.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule,
    TokenModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
