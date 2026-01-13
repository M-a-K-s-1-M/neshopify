import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SiteUsersController } from './site-users.controller';
import { SiteUsersService } from './site-users.service';

@Module({
  controllers: [UsersController, SiteUsersController],
  providers: [UsersService, SiteUsersService],
  exports: [UsersService, SiteUsersService],
})
export class UsersModule { }
