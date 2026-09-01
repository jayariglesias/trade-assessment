import type { TradeDto, TradeSide, TradeStatus } from "@shared/api-contracts";

export type SideFilter = "ALL" | TradeSide;
export type StatusFilter = "ALL" | TradeStatus;

export type SortKey =
  | "tradeTimestamp"
  | "symbol"
  | "price"
  | "quantity"
  | "id"
  | "trader"
  | "status";

export type SortDirection = "asc" | "desc";

export interface BlotterFilters {
  symbol: string;
  side: SideFilter;
  trader: string;
  status: StatusFilter;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

export const defaultBlotterFilters: BlotterFilters = {
  symbol: "",
  side: "ALL",
  trader: "",
  status: "ALL",
  sortKey: "tradeTimestamp",
  sortDirection: "desc",
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 25;

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
}

export function getPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return { currentPage, totalPages, totalItems, from, to };
}

export function paginateTrades<T>(items: T[], page: number, pageSize: number): T[] {
  const { currentPage } = getPaginationMeta(items.length, page, pageSize);
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

export function filterAndSortTrades(
  trades: TradeDto[],
  filters: BlotterFilters,
): TradeDto[] {
  const symbolQuery = filters.symbol.trim().toUpperCase();
  const traderQuery = filters.trader.trim().toUpperCase();

  const filtered = trades.filter((trade) => {
    if (filters.side !== "ALL" && trade.side !== filters.side) {
      return false;
    }
    if (filters.status !== "ALL" && trade.status !== filters.status) {
      return false;
    }
    if (symbolQuery && !trade.symbol.toUpperCase().includes(symbolQuery)) {
      return false;
    }
    if (traderQuery && !trade.trader.toUpperCase().includes(traderQuery)) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let value = 0;

    switch (filters.sortKey) {
      case "symbol":
        value = compareValues(a.symbol, b.symbol);
        break;
      case "price":
        value = compareValues(a.price, b.price);
        break;
      case "quantity":
        value = compareValues(a.quantity, b.quantity);
        break;
      case "id":
        value = compareValues(a.id, b.id);
        break;
      case "trader":
        value = compareValues(a.trader, b.trader);
        break;
      case "status":
        value = compareValues(a.status, b.status);
        break;
      case "tradeTimestamp":
      default:
        value = compareValues(
          new Date(a.tradeTimestamp).getTime(),
          new Date(b.tradeTimestamp).getTime(),
        );
        break;
    }

    return filters.sortDirection === "asc" ? value : -value;
  });

  return sorted;
}

export interface SymbolPosition {
  symbol: string;
  netQuantity: number;
  buyQuantity: number;
  sellQuantity: number;
  tradeCount: number;
}

export function netPositions(trades: TradeDto[]): SymbolPosition[] {
  const bySymbol = new Map<string, SymbolPosition>();

  for (const trade of trades) {
    if (trade.status !== "ACTIVE") {
      continue;
    }

    const current = bySymbol.get(trade.symbol) ?? {
      symbol: trade.symbol,
      netQuantity: 0,
      buyQuantity: 0,
      sellQuantity: 0,
      tradeCount: 0,
    };

    if (trade.side === "BUY") {
      current.buyQuantity += trade.quantity;
      current.netQuantity += trade.quantity;
    } else {
      current.sellQuantity += trade.quantity;
      current.netQuantity -= trade.quantity;
    }
    current.tradeCount += 1;
    bySymbol.set(trade.symbol, current);
  }

  return [...bySymbol.values()].sort((a, b) => {
    const byAbsNet = Math.abs(b.netQuantity) - Math.abs(a.netQuantity);
    if (byAbsNet !== 0) {
      return byAbsNet;
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

export function exportTradesCsv(trades: TradeDto[]): void {
  const header =
    "id,symbol,side,quantity,price,trader,tradeDate,status,book,counterparty,tradeTimestamp";
  const rows = trades.map((trade) =>
    [
      trade.id,
      trade.symbol,
      trade.side,
      trade.quantity,
      trade.price,
      trade.trader,
      trade.tradeDate,
      trade.status,
      trade.book,
      trade.counterparty,
      trade.tradeTimestamp,
    ].join(","),
  );

  const blob = new Blob([[header, ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
