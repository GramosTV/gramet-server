import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongooseValidationExceptionFilter } from './common/filters/mongoose-validation-exception.filter';
import { json } from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new MongooseValidationExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(
    '/transactions/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
