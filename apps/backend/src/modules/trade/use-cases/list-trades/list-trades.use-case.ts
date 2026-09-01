import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { toTrade } from '../../shared/trade.mapper';

@Injectable()
export class ListTradesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const trades = await this.prisma.trade.findMany({
      orderBy: { tradeTimestamp: 'desc' },
    });

    return trades.map(toTrade);
  }
}
