import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TrimStringsPipe } from './common/pipes';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const appEnv = configService.get<string>('app.env') ?? 'development';
  const isProd = appEnv === 'production';

  const clientUrl = configService.get<string>('app.clientUrl') ?? '';
  const origins = clientUrl
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => url.replace(/\/+$/g, ''));


  const port = configService.get<number>('app.port') ?? 5000;


  app.setGlobalPrefix('api');

  // Статические файлы (например, загруженные изображения товаров)
  // Важно: middleware статики не зависит от globalPrefix.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(
    new TrimStringsPipe(), // Обрезаем пробелы во всех строковых payload до валидации
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Neshopify API')
    .setDescription('REST API для конструктора, каталога и магазина')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth('accessToken')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  app.enableCors({
    // В dev разрешаем любой origin (нужно для cookie-auth из разных фронтендов).
    // В production — строго по списку CLIENT_URL.
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!isProd) return callback(null, true);
      if (!origins.length) return callback(null, false);
      return callback(null, origins.includes(origin));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'X-Requested-With',
      'Accept',
      'Authorization',
      'X-Skip-Auth-Redirect',
      'x-skip-auth-redirect',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  await app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
}
bootstrap();
