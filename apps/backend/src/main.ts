import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfigService);

  app.enableCors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.getHttpAdapter().getInstance().get('/health', (_req: Request, res: Response) => {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
  });

  app.enableShutdownHooks();
  await app.listen(config.port, '0.0.0.0');
}

void bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
