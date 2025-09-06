import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET, POST, PATCH, DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, accessToken',
  });

  app.use(json({ limit: '50mb' }));

  await app.listen(8001);
}
bootstrap();
