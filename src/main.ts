import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('main.ts');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT, () => {
    logger.log(`Server running on port ${process.env.PORT}`);
  });
}
bootstrap();
