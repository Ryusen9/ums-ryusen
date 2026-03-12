import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT);
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}`);
}
bootstrap();
