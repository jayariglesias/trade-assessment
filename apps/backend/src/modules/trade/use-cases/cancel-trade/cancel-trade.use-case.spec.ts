import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('../../../../infrastructure/websocket/trades.gateway', () => ({
  TradesGateway: class TradesGateway {},
}));

import { CancelTradeUseCase } from './cancel-trade.use-case';

describe('CancelTradeUseCase', () => {
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
          quantity: 100,
          price: 178.5,
          side: 'BUY',
          trader: 'JSMITH',
          tradeDate: '2026-08-18',
          status: 'CANCELLED',
          book: 'EQUITIES_UK',
          counterparty: 'Goldman Sachs',
          tradeTimestamp: new Date('2026-08-18T09:15:23Z'),
        }),
      },
    };

    const useCase = new CancelTradeUseCase(
      prisma as never,
      tradesGateway as never,
    );

    return { useCase, prisma };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks an active trade as cancelled', async () => {
    const { useCase, prisma } = createUseCase({
      id: 'TRD-100001',
      status: 'ACTIVE',
    });

    const result = await useCase.execute({ id: 'TRD-100001' });

    expect(prisma.trade.update).toHaveBeenCalledWith({
      where: { id: 'TRD-100001' },
      data: { status: 'CANCELLED' },
    });
    expect(result.status).toBe('CANCELLED');
    expect(tradesGateway.emitTradeUpdated).toHaveBeenCalled();
  });

  it('throws when the trade does not exist', async () => {
    const { useCase } = createUseCase(null);

    await expect(useCase.execute({ id: 'TRD-999999' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when the trade is already cancelled', async () => {
    const { useCase } = createUseCase({
      id: 'TRD-100001',
      status: 'CANCELLED',
    });

    await expect(useCase.execute({ id: 'TRD-100001' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
