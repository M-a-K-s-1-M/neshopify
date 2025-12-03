import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    RolesModule,
  ],
})
export class AppModule { }
