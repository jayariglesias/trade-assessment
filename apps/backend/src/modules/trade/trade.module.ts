import { Module } from '@nestjs/common';
import { CancelTradeUseCase } from './use-cases/cancel-trade/cancel-trade.use-case';
import { CreateTradeUseCase } from './use-cases/create-trade/create-trade.use-case';
import { GetTradeUseCase } from './use-cases/get-trade/get-trade.use-case';
import { ListTradesUseCase } from './use-cases/list-trades/list-trades.use-case';
import { UpdateTradeUseCase } from './use-cases/update-trade/update-trade.use-case';
import { TradeController } from './trade.controller';

@Module({
  controllers: [TradeController],
  providers: [
    ListTradesUseCase,
    GetTradeUseCase,
    CreateTradeUseCase,
    UpdateTradeUseCase,
    CancelTradeUseCase,
  ],
})
export class TradeModule {}
