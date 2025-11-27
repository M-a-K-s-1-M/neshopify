import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TokenModule } from '../tokens/token.module';
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TokenModule,
  ]
})
export class UsersModule { }
