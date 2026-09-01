import { Global, Module } from '@nestjs/common';
import { TradesGateway } from './trades.gateway';

@Global()
@Module({
  providers: [TradesGateway],
  exports: [TradesGateway],
})
export class WebsocketModule {}
