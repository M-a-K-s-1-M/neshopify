import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TrimStringsPipe } from './common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  const clientUrl = configService.get<string>('app.clientUrl') ?? '';
  const origins = clientUrl.split(',').map((url) => url.trim()).filter(Boolean);


  const port = configService.get<number>('app.port') ?? 5000;


  app.setGlobalPrefix('api');

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
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  await app.listen(port);
}
bootstrap();
