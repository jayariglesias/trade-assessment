import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('../../../../infrastructure/websocket/trades.gateway', () => ({
  TradesGateway: class TradesGateway {},
}));

import { UpdateTradeUseCase } from './update-trade.use-case';

describe('UpdateTradeUseCase', () => {
  const tradesGateway = {
    emitTradeUpdated: jest.fn(),
  };

  function createUseCase(existing: Record<string, unknown> | null) {
    const prisma = {
      trade: {
        findUnique: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue({
          id: 'TRD-100001',
          symbol: 'AAPL',
          quantity: 200,
          price: 178.5,
          side: 'BUY',
          trader: 'JSMITH',
          tradeDate: '2026-08-18',
          status: 'ACTIVE',
          book: 'EQUITIES_UK',
          counterparty: 'Goldman Sachs',
          tradeTimestamp: new Date('2026-08-18T09:15:23Z'),
        }),
      },
    };

    const useCase = new UpdateTradeUseCase(
      prisma as never,
      tradesGateway as never,
    );

    return { useCase, prisma };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates an active trade', async () => {
    const { useCase, prisma } = createUseCase({
      id: 'TRD-100001',
      status: 'ACTIVE',
    });

    const result = await useCase.execute({
      id: 'TRD-100001',
      quantity: 200,
    });

    expect(prisma.trade.update).toHaveBeenCalledWith({
      where: { id: 'TRD-100001' },
      data: { quantity: 200 },
    });
    expect(result.quantity).toBe(200);
    expect(tradesGateway.emitTradeUpdated).toHaveBeenCalled();
  });

  it('throws when the trade does not exist', async () => {
    const { useCase } = createUseCase(null);

    await expect(
      useCase.execute({ id: 'TRD-999999', quantity: 200 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the trade is cancelled', async () => {
    const { useCase } = createUseCase({
      id: 'TRD-100001',
      status: 'CANCELLED',
    });

    await expect(
      useCase.execute({ id: 'TRD-100001', quantity: 200 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
