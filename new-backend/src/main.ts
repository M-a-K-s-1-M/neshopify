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
import express from 'express';

async function bootstrap() {
  // Важно для Stripe webhook: требуется raw body (Buffer), иначе проверка подписи падает.
  // Отключаем дефолтный bodyParser Nest и подключаем middleware вручную.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
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

  // Stripe webhook требует raw body для проверки подписи.
  // Самый надёжный вариант — сохранить raw bytes через verify-хук JSON parser.
  // Тогда дальнейшая логика может работать и с распарсенным JSON, и с подписью.
  app.use(
    '/api/payments/webhooks/stripe',
    express.json({
      verify: (req, _res, buf) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).rawBody = buf;
      },
    }),
  );

  // Для остальных маршрутов включаем стандартный парсинг JSON/форм.
  // Важно: исключаем Stripe webhook, иначе body-parser может сломать raw body.
  const jsonParser = express.json();
  const urlencodedParser = express.urlencoded({ extended: true });
  app.use((req, res, next) => {
    if (req.originalUrl?.startsWith('/api/payments/webhooks/stripe')) return next();
    return jsonParser(req, res, next);
  });
  app.use((req, res, next) => {
    if (req.originalUrl?.startsWith('/api/payments/webhooks/stripe')) return next();
    return urlencodedParser(req, res, next);
  });

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

  // На Windows `localhost` часто резолвится в IPv6 ::1.
  // Слушаем на '::', чтобы принимать и IPv6, и IPv4-mapped подключения.
  await app.listen(port, '::');
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${port}`);
}
bootstrap();
