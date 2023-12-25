import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as xss from 'xss-clean';

import { AppModule } from './app.module';
import { connectDb } from './config/dbconnection';
import { AllExceptionFilter } from './filters/all-exception.filter';

async function bootstrap() {
  await connectDb();
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(xss());
  app.enableCors();

  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
