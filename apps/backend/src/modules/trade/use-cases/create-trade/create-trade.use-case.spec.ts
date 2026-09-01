jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('../../../../infrastructure/websocket/trades.gateway', () => ({
  TradesGateway: class TradesGateway {},
}));

import { CreateTradeUseCase } from './create-trade.use-case';

describe('CreateTradeUseCase', () => {
  const tradesGateway = {
    emitTradeCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an active trade with the next id and emits it', async () => {
    const created = {
      id: 'TRD-100002',
      symbol: 'AAPL',
      quantity: 100,
      price: 10.5,
      side: 'BUY',
      trader: 'JSMITH',
      tradeDate: '2026-08-18',
      status: 'ACTIVE',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
      tradeTimestamp: new Date('2026-08-18T09:15:23Z'),
    };

    const prisma = {
      trade: {
        findMany: jest.fn().mockResolvedValue([{ id: 'TRD-100001' }]),
        create: jest.fn().mockResolvedValue(created),
      },
    };

    const useCase = new CreateTradeUseCase(
      prisma as never,
      tradesGateway as never,
    );

    const result = await useCase.execute({
      symbol: 'AAPL',
      quantity: 100,
      price: 10.5,
      side: 'BUY',
      trader: 'JSMITH',
      tradeDate: '2026-08-18',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
    });

    expect(prisma.trade.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'TRD-100002',
        status: 'ACTIVE',
        symbol: 'AAPL',
        trader: 'JSMITH',
      }),
    });
    expect(result.id).toBe('TRD-100002');
    expect(result.status).toBe('ACTIVE');
    expect(tradesGateway.emitTradeCreated).toHaveBeenCalledWith(result);
  });
});
