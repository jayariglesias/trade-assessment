import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TradesGateway } from '../../../../infrastructure/websocket/trades.gateway';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { toTrade } from '../../shared/trade.mapper';

@Injectable()
export class CancelTradeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradesGateway: TradesGateway,
  ) {}

  async execute(input: { id: string }) {
    const existing = await this.prisma.trade.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Trade not found');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Trade is already cancelled');
    }

    const record = await this.prisma.trade.update({
      where: { id: input.id },
      data: { status: 'CANCELLED' },
    });

    const trade = toTrade(record);
    this.tradesGateway.emitTradeUpdated(trade);
    return trade;
  }
}
