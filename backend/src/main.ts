import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectDb } from './config/dbconnection';

async function bootstrap() {
  await connectDb();
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
