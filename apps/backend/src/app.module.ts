import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
import { TradeModule } from './modules/trade/trade.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, WebsocketModule, TradeModule],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const message =
            errors
              .flatMap((error) => Object.values(error.constraints ?? {}))
              .join(' ') || 'Validation failed.';
          return new BadRequestException(message);
        },
      }),
    },
  ],
})
export class AppModule {}
