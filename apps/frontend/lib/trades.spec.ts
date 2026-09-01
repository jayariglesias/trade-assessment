import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TradeDto } from "@shared/api-contracts";
import {
  defaultBlotterFilters,
  filterAndSortTrades,
  getPaginationMeta,
  netPositions,
  paginateTrades,
} from "./trades";

function trade(overrides: Partial<TradeDto>): TradeDto {
  return {
    id: "TRD-100001",
    symbol: "AAPL",
    quantity: 100,
    price: 10,
    side: "BUY",
    trader: "JSMITH",
    tradeDate: "2026-08-18",
    status: "ACTIVE",
    book: "EQUITIES_UK",
    counterparty: "Goldman Sachs",
    tradeTimestamp: "2026-08-18T09:15:23.000Z",
    ...overrides,
  };
}

const sample: TradeDto[] = [
  trade({ id: "TRD-100001", symbol: "AAPL", trader: "JSMITH", quantity: 100 }),
  trade({
    id: "TRD-100002",
    symbol: "MSFT",
    trader: "ABROWN",
    side: "SELL",
    quantity: 40,
    price: 20,
    tradeTimestamp: "2026-08-18T10:00:00.000Z",
  }),
  trade({
    id: "TRD-100003",
    symbol: "AAPL",
    trader: "JSMITH",
    side: "SELL",
    quantity: 30,
    status: "CANCELLED",
  }),
];

describe("filterAndSortTrades", () => {
  it("filters by symbol, trader, side, and status", () => {
    const filtered = filterAndSortTrades(sample, {
      ...defaultBlotterFilters,
      symbol: "aap",
      trader: "jsmith",
      side: "BUY",
      status: "ACTIVE",
    });

    assert.deepEqual(
      filtered.map((item) => item.id),
      ["TRD-100001"],
    );
  });

  it("sorts by price descending", () => {
    const sorted = filterAndSortTrades(sample, {
      ...defaultBlotterFilters,
      sortKey: "price",
      sortDirection: "desc",
    });

    assert.equal(sorted[0]?.id, "TRD-100002");
  });
});

describe("netPositions", () => {
  it("ignores cancelled trades and nets buy vs sell", () => {
    const positions = netPositions(sample);
    const apple = positions.find((item) => item.symbol === "AAPL");
    const microsoft = positions.find((item) => item.symbol === "MSFT");

    assert.equal(apple?.netQuantity, 100);
    assert.equal(apple?.tradeCount, 1);
    assert.equal(microsoft?.netQuantity, -40);
  });
});

describe("pagination", () => {
  const items = Array.from({ length: 30 }, (_, index) =>
    trade({ id: `TRD-${100001 + index}` }),
  );

  it("returns the requested page slice", () => {
    const page = paginateTrades(items, 2, 10);
    assert.equal(page.length, 10);
    assert.equal(page[0]?.id, "TRD-100011");
    assert.equal(page[9]?.id, "TRD-100020");
  });

  it("clamps page when results shrink", () => {
    const meta = getPaginationMeta(15, 3, 10);
    assert.equal(meta.currentPage, 2);
    assert.equal(meta.from, 11);
    assert.equal(meta.to, 15);
  });
});
