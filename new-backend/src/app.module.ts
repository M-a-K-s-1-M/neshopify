import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { SitesModule } from './modules/sites/sites.module';
import { PageBuilderModule } from './modules/page-builder/page-builder.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { appConfig, jwtConfig, stripeConfig, validateEnv } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.development.env', '.production.env'],
      load: [appConfig, jwtConfig, stripeConfig],
      validate: validateEnv,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    RolesModule,
    SitesModule,
    PageBuilderModule,
    CatalogModule,
    CommerceModule,
  ],
})
export class AppModule { }
