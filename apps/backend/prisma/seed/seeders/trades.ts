import type { PrismaClient } from '../../src/infrastructure/database/generated/prisma/client';
import { generateSampleTrades, sampleTradeCount } from '../data/trades';

export async function seedTrades(prisma: PrismaClient) {
  const count = await prisma.trade.count();

  if (count > 0) {
    console.log(`Database already has ${count} trades. Skipping seed.`);
    return;
  }

  const trades = generateSampleTrades(sampleTradeCount);

  for (const trade of trades) {
    await prisma.trade.create({ data: trade });
  }

  console.log(`Seeded ${trades.length} trades.`);
}
