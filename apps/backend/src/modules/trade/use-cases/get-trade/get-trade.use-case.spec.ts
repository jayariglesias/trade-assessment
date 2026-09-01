import { NotFoundException } from '@nestjs/common';

jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { GetTradeUseCase } from './get-trade.use-case';

const sampleRecord = {
  id: 'TRD-100001',
  symbol: 'AAPL',
  quantity: 100,
  price: 178.5,
  side: 'BUY',
  trader: 'JSMITH',
  tradeDate: '2026-08-18',
  status: 'ACTIVE',
  book: 'EQUITIES_UK',
  counterparty: 'Goldman Sachs',
  tradeTimestamp: new Date('2026-08-18T09:15:23Z'),
};

describe('GetTradeUseCase', () => {
  it('returns a mapped trade', async () => {
    const prisma = {
      trade: {
        findUnique: jest.fn().mockResolvedValue(sampleRecord),
      },
    };
    const useCase = new GetTradeUseCase(prisma as never);

    const trade = await useCase.execute({ id: 'TRD-100001' });

    expect(trade.id).toBe('TRD-100001');
    expect(trade.symbol).toBe('AAPL');
    expect(trade.tradeTimestamp).toBe('2026-08-18T09:15:23.000Z');
  });

  it('throws when the trade does not exist', async () => {
    const prisma = {
      trade: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const useCase = new GetTradeUseCase(prisma as never);

    await expect(useCase.execute({ id: 'TRD-999999' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
