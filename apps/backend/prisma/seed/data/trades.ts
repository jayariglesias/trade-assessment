import type { TradeSide, TradeStatus } from '@shared/api-contracts';

const symbols = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
  'NVDA',
  'META',
  'JPM',
  'V',
  'UNH',
  'XOM',
  'BAC',
];

const traders = [
  'JSMITH',
  'ABROWN',
  'MJONES',
  'KLEE',
  'RPATEL',
  'SCHEN',
  'TWILSON',
  'DNGUYEN',
];

const books = ['EQUITIES_UK', 'EQUITIES_US', 'TECH_GROWTH', 'FINANCIALS_EU'];

const counterparties = [
  'Goldman Sachs',
  'JP Morgan',
  'Morgan Stanley',
  'Barclays',
  'Citigroup',
  'Deutsche Bank',
  'UBS',
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomPrice(symbol: string): number {
  const base: Record<string, number> = {
    AAPL: 227,
    MSFT: 534,
    GOOGL: 178,
    AMZN: 185,
    TSLA: 342,
    NVDA: 875,
    META: 512,
    JPM: 199,
    V: 280,
    UNH: 520,
    XOM: 118,
    BAC: 38,
  };
  const anchor = base[symbol] ?? 100;
  return Number((anchor * (0.9 + Math.random() * 0.2)).toFixed(2));
}

function randomTimestamp(daysBack: number): Date {
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  const date = new Date(now - offsetMs);
  date.setHours(9 + Math.floor(Math.random() * 8));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date;
}

export function generateSampleTrades(count: number): Array<{
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  side: TradeSide;
  trader: string;
  tradeDate: string;
  status: TradeStatus;
  book: string;
  counterparty: string;
  tradeTimestamp: Date;
}> {
  const trades = [];

  for (let index = 0; index < count; index += 1) {
    const symbol = pick(symbols);
    const tradeTimestamp = randomTimestamp(30);
    const status: TradeStatus = Math.random() < 0.05 ? 'CANCELLED' : 'ACTIVE';

    trades.push({
      id: `TRD-${100001 + index}`,
      symbol,
      quantity: Math.floor(100 + Math.random() * 9900),
      price: randomPrice(symbol),
      side: Math.random() < 0.5 ? 'BUY' : 'SELL',
      trader: pick(traders),
      tradeDate: tradeTimestamp.toISOString().slice(0, 10),
      status,
      book: pick(books),
      counterparty: pick(counterparties),
      tradeTimestamp,
    });
  }

  return trades;
}

export const sampleTradeCount = 300;
