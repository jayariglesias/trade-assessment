import type { PrismaService } from '../../../infrastructure/database/prisma.service';

const TRADE_ID_PREFIX = 'TRD-';
const TRADE_ID_START = 100_000;

export function nextTradeIdFromIds(ids: string[]): string {
  const max = ids.reduce((current, id) => {
    const numeric = Number.parseInt(id.replace(TRADE_ID_PREFIX, ''), 10);
    return Number.isFinite(numeric) && numeric > current ? numeric : current;
  }, TRADE_ID_START);

  return `${TRADE_ID_PREFIX}${max + 1}`;
}

export async function nextTradeId(prisma: PrismaService): Promise<string> {
  const trades = await prisma.trade.findMany({
    select: { id: true },
  });

  return nextTradeIdFromIds(trades.map((trade) => trade.id));
}
