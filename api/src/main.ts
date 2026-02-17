import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './config';

const PORT = envConfig.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log(`Application started successfully on port ${PORT}`);
  })
  .catch((error) => {
    console.error('Application failed to start', error);
    process.exit(1);
  });
