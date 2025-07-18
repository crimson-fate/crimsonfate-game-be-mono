import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';

import { ValidationPipe } from '@nestjs/common';
import { configureSwagger } from '@app/shared/config/configSwagger';
import { configureValidation } from '@app/shared/config/configValidation';

import configuration from '@app/shared/configuration';
import { json, urlencoded } from 'express';
import { configureCors, whitelistPage } from '@app/shared/config/configCors';

mongoose.set('debug', true);

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = configuration().PORT.API;
  app.enableCors(configureCors(whitelistPage));
  configureSwagger(app);
  configureValidation(app);
  app.useGlobalPipes(new ValidationPipe());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(port, () => {
    console.log(
      `Game API Service is running on port ${port} | Doc Run on http://localhost:${port}/docs | API Run on http://localhost:${port}`,
    );
  });
}
bootstrap();
