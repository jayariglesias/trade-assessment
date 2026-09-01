import { Injectable } from '@nestjs/common';
import { TradesGateway } from '../../../../infrastructure/websocket/trades.gateway';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { nextTradeId } from '../../shared/next-trade-id';
import { toTrade } from '../../shared/trade.mapper';
import type { CreateTradeDto } from './create-trade.dto';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class CreateTradeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradesGateway: TradesGateway,
  ) {}

  async execute(input: CreateTradeDto) {
    const id = await nextTradeId(this.prisma);
    const tradeDate = input.tradeDate ?? todayDateString();
    const tradeTimestamp = input.tradeTimestamp
      ? new Date(input.tradeTimestamp)
      : new Date();

    const record = await this.prisma.trade.create({
      data: {
        id,
        symbol: input.symbol,
        quantity: input.quantity,
        price: input.price,
        side: input.side,
        trader: input.trader,
        tradeDate,
        book: input.book,
        counterparty: input.counterparty,
        tradeTimestamp,
        status: 'ACTIVE',
      },
    });

    const trade = toTrade(record);
    this.tradesGateway.emitTradeCreated(trade);
    return trade;
  }
}
