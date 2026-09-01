import type { TradeDto } from '@shared/api-contracts';

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

export function toTrade(record: TradeRecord): TradeDto {
  return {
    id: record.id,
    symbol: record.symbol,
    quantity: record.quantity,
    price: record.price,
    side: record.side as TradeDto['side'],
    trader: record.trader,
    tradeDate: record.tradeDate,
    status: record.status as TradeDto['status'],
    book: record.book,
    counterparty: record.counterparty,
    tradeTimestamp: record.tradeTimestamp.toISOString(),
  };
}
