import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

jest.mock('@prisma/adapter-better-sqlite3', () => ({
  PrismaBetterSqlite3: class PrismaBetterSqlite3 {},
}));

jest.mock('../../infrastructure/database/generated/prisma/client', () => ({
  PrismaClient: class PrismaClient {
    async $connect() {
      return undefined;
    }
    async $disconnect() {
      return undefined;
    }
  },
}));

import { AppModule } from '../../app.module';
import { PrismaService } from '../../infrastructure/database/prisma.service';

const payload = {
  symbol: 'AAPL',
  quantity: 500,
  price: 227.45,
  side: 'BUY',
  trader: 'JSMITH',
  tradeDate: '2026-08-18',
  book: 'EQUITIES_UK',
  counterparty: 'Goldman Sachs',
};

type TradeRecord = {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  side: string;
  trader: string;
  tradeDate: string;
  status: string;
  book: string;
  counterparty: string;
  tradeTimestamp: Date;
};

function createInMemoryPrisma() {
  const records: TradeRecord[] = [];

  return {
    $connect: async () => undefined,
    $disconnect: async () => undefined,
    trade: {
      findMany: async (args?: {
        select?: { id?: boolean };
        orderBy?: { tradeTimestamp?: 'asc' | 'desc' };
      }) => {
        const rows = [...records];
        if (args?.orderBy?.tradeTimestamp === 'desc') {
          rows.sort(
            (a, b) => b.tradeTimestamp.getTime() - a.tradeTimestamp.getTime(),
          );
        }
        if (args?.select?.id) {
          return rows.map((row) => ({ id: row.id }));
        }
        return rows;
      },
      findUnique: async ({ where }: { where: { id: string } }) =>
        records.find((row) => row.id === where.id) ?? null,
      create: async ({ data }: { data: TradeRecord }) => {
        records.push(data);
        return data;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<TradeRecord>;
      }) => {
        const index = records.findIndex((row) => row.id === where.id);
        const current = records[index];
        if (!current) {
          return null;
        }
        const next = { ...current, ...data };
        records[index] = next;
        return next;
      },
    },
  };
}

describe('Trade API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'file:./prisma/test-e2e.sqlite';
    process.env.PORT = '39991';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createInMemoryPrisma())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates, reads, amends, and cancels a trade', async () => {
    const created = await request(app.getHttpServer())
      .post('/trades')
      .send(payload)
      .expect(201);

    expect(created.body.id).toMatch(/^TRD-\d+$/);
    expect(created.body.status).toBe('ACTIVE');
    expect(created.body.symbol).toBe('AAPL');

    const id = created.body.id as string;

    const listed = await request(app.getHttpServer()).get('/trades').expect(200);
    expect(listed.body.some((trade: { id: string }) => trade.id === id)).toBe(
      true,
    );

    const fetched = await request(app.getHttpServer())
      .get(`/trades/${id}`)
      .expect(200);
    expect(fetched.body.trader).toBe('JSMITH');

    const amended = await request(app.getHttpServer())
      .put(`/trades/${id}`)
      .send({ quantity: 800 })
      .expect(200);
    expect(amended.body.quantity).toBe(800);

    const cancelled = await request(app.getHttpServer())
      .patch(`/trades/${id}/cancel`)
      .expect(200);
    expect(cancelled.body.status).toBe('CANCELLED');

    await request(app.getHttpServer())
      .put(`/trades/${id}`)
      .send({ quantity: 900 })
      .expect(400);

    await request(app.getHttpServer()).patch(`/trades/${id}/cancel`).expect(400);
  });

  it('rejects invalid create payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/trades')
      .send({ ...payload, quantity: 0 })
      .expect(400);

    expect(String(response.body.message)).toContain('Quantity');
  });

  it('returns 404 for a missing trade', async () => {
    await request(app.getHttpServer()).get('/trades/TRD-999999').expect(404);
  });
});
