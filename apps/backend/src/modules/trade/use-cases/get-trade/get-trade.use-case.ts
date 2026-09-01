import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { toTrade } from '../../shared/trade.mapper';

@Injectable()
export class GetTradeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { id: string }) {
    const record = await this.prisma.trade.findUnique({
      where: { id: input.id },
    });

    if (!record) {
      throw new NotFoundException('Trade not found');
    }

    return toTrade(record);
  }
}
