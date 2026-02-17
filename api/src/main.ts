import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { envConfig } from './config';

const PORT = envConfig.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  });
  app.use(helmet());
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
