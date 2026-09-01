import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TradesGateway } from '../../../../infrastructure/websocket/trades.gateway';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { toTrade } from '../../shared/trade.mapper';
import type { UpdateTradeDto } from './update-trade.dto';

@Injectable()
export class UpdateTradeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradesGateway: TradesGateway,
  ) {}

  async execute(input: UpdateTradeDto & { id: string }) {
    const { id, ...data } = input;

    const existing = await this.prisma.trade.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Trade not found');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot amend a cancelled trade');
    }

    const record = await this.prisma.trade.update({
      where: { id },
      data,
    });

    const trade = toTrade(record);
    this.tradesGateway.emitTradeUpdated(trade);
    return trade;
  }
}
