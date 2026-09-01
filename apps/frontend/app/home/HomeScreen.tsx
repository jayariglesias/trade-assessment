"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TradeDto } from "@shared/api-contracts";
import { BlotterPagination } from "@/components/features/BlotterPagination";
import { BlotterToolbar } from "@/components/features/BlotterToolbar";
import { PositionSummary } from "@/components/features/PositionSummary";
import { useTradeEntry } from "@/components/features/TradeEntryProvider";
import { TradeTable, TradeTableSkeleton } from "@/components/features/TradeTable";
import { useTrades } from "@/hooks/useTrades";
import {
  DEFAULT_PAGE_SIZE,
  defaultBlotterFilters,
  exportTradesCsv,
  filterAndSortTrades,
  getPaginationMeta,
  netPositions,
  paginateTrades,
  type BlotterFilters,
  type PageSize,
} from "@/lib/trades";

export function HomeScreen() {
  const { openCreate, openEdit, showNotice, setOnTradeSaved } = useTradeEntry();
  const [filters, setFilters] = useState<BlotterFilters>(defaultBlotterFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const {
    trades,
    loading,
    refreshing,
    error,
    cancellingId,
    recentIds,
    liveMessage,
    cancelTradeById,
    refreshTrades,
    upsertTrade,
  } = useTrades();

  const filteredTrades = useMemo(
    () => filterAndSortTrades(trades, filters),
    [trades, filters],
  );
  const pagination = useMemo(
    () => getPaginationMeta(filteredTrades.length, page, pageSize),
    [filteredTrades.length, page, pageSize],
  );
  const pagedTrades = useMemo(
    () => paginateTrades(filteredTrades, pagination.currentPage, pageSize),
    [filteredTrades, pagination.currentPage, pageSize],
  );
  const positions = useMemo(() => netPositions(trades), [trades]);
  const recentSymbols = useMemo(() => {
    const symbols = new Set<string>();
    for (const trade of trades) {
      if (recentIds.has(trade.id)) {
        symbols.add(trade.symbol);
      }
    }
    return symbols;
  }, [recentIds, trades]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page !== pagination.currentPage) {
      setPage(pagination.currentPage);
    }
  }, [page, pagination.currentPage]);

  useEffect(() => {
    if (liveMessage) {
      showNotice(liveMessage, "info");
    }
  }, [liveMessage, showNotice]);

  const upsertTradeRef = useRef(upsertTrade);
  upsertTradeRef.current = upsertTrade;
  const refreshTradesRef = useRef(refreshTrades);
  refreshTradesRef.current = refreshTrades;

  useEffect(() => {
    setOnTradeSaved((trade, action) => {
      upsertTradeRef.current(trade);

      if (action === "created") {
        setFilters({
          ...defaultBlotterFilters,
          sortKey: "tradeTimestamp",
          sortDirection: "desc",
        });
        setPage(1);
        void refreshTradesRef.current();
      }
    });

    return () => setOnTradeSaved(null);
  }, [setOnTradeSaved]);

  useEffect(() => {
    const newest = filteredTrades[0];
    if (
      !newest ||
      !recentIds.has(newest.id) ||
      filters.sortKey !== "tradeTimestamp" ||
      filters.sortDirection !== "desc"
    ) {
      return;
    }
    if (page !== 1) {
      setPage(1);
    }
  }, [filteredTrades, filters.sortDirection, filters.sortKey, page, recentIds]);
  const handleFiltersChange = useCallback((next: BlotterFilters) => {
    setFilters(next);
  }, []);

  const handlePageSizeChange = useCallback((nextPageSize: PageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  const handleEdit = useCallback(
    (trade: TradeDto) => {
      openEdit(trade);
    },
    [openEdit],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      const trade = await cancelTradeById(id);
      showNotice(
        `Trade cancelled: ${trade.id} · ${trade.side} ${trade.quantity.toLocaleString()} ${trade.symbol}`,
        "cancel",
      );
      return trade;
    },
    [cancelTradeById, showNotice],
  );
  const activeCount = trades.filter((trade) => trade.status === "ACTIVE").length;
  const buyCount = trades.filter((trade) => trade.side === "BUY").length;
  const sellCount = trades.length - buyCount;

  return (
    <section aria-labelledby="blotter-heading" className="space-y-4 sm:space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1
            id="blotter-heading"
            className="text-xl font-semibold tracking-tight sm:text-3xl"
          >
            Trade blotter
          </h1>
          <p className="mt-1 text-sm text-muted">
            <span className="sm:hidden">Live equity trades.</span>
            <span className="hidden sm:inline">
              Live equity trades. New rows highlight as they stream in.
            </span>
          </p>
        </div>
        <dl className="grid grid-cols-4 gap-2 sm:flex sm:gap-2">
          <div className="rounded-md border border-border bg-surface-raised px-2 py-2 sm:min-w-19 sm:px-3 sm:py-2">
            <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-muted">
              Total
            </dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums sm:text-lg">
              {trades.length}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-surface-raised px-2 py-2 sm:min-w-19 sm:px-3 sm:py-2">
            <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-muted">
              Active
            </dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums sm:text-lg">
              {activeCount}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-surface-raised px-2 py-2 sm:min-w-19 sm:px-3 sm:py-2">
            <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-buy">
              Buy
            </dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-buy sm:text-lg">
              {buyCount}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-surface-raised px-2 py-2 sm:min-w-19 sm:px-3 sm:py-2">
            <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-sell">
              Sell
            </dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-sell sm:text-lg">
              {sellCount}
            </dd>
          </div>
        </dl>
      </header>

      <PositionSummary
        positions={positions}
        highlightSymbols={recentSymbols}
      />

      <div>
        <BlotterToolbar
          filters={filters}
          totalCount={trades.length}
          filteredCount={filteredTrades.length}
          refreshing={refreshing}
          onFiltersChange={handleFiltersChange}
          onRefresh={() => void refreshTrades()}
          onExport={() => exportTradesCsv(filteredTrades)}
          onNewTrade={openCreate}
        />
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {error ? (
          <p
            className="mb-4 rounded-lg border border-sell/30 bg-sell-bg px-4 py-3 text-sm text-sell"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {loading ? (
          <div aria-busy="true" aria-label="Loading trades">
            <p className="mb-3 text-muted">Loading trades...</p>
            <TradeTableSkeleton />
          </div>
        ) : (
          <>
            <TradeTable
              trades={pagedTrades}
              totalCount={filteredTrades.length}
              recentIds={recentIds}
              cancellingId={cancellingId}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onNewTrade={openCreate}
              hasFilters={
                filters.symbol.trim() !== "" ||
                filters.trader.trim() !== "" ||
                filters.side !== "ALL" ||
                filters.status !== "ALL" ||
                filteredTrades.length !== trades.length
              }
            />
            <BlotterPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              from={pagination.from}
              to={pagination.to}
              totalItems={pagination.totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
    </section>
  );
}
