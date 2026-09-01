"use client";

import {
  DownloadIcon,
  FilterXIcon,
  PlusIcon,
  RefreshIcon,
} from "@/components/common/Icons";
import type { BlotterFilters, SideFilter, SortKey, StatusFilter } from "@/lib/trades";

interface BlotterToolbarProps {
  filters: BlotterFilters;
  totalCount: number;
  filteredCount: number;
  refreshing: boolean;
  onFiltersChange: (next: BlotterFilters) => void;
  onRefresh: () => void;
  onExport: () => void;
  onNewTrade: () => void;
}

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "tradeTimestamp", label: "Timestamp" },
  { value: "symbol", label: "Symbol" },
  { value: "trader", label: "Trader" },
  { value: "status", label: "Status" },
  { value: "price", label: "Price" },
  { value: "quantity", label: "Quantity" },
  { value: "id", label: "ID" },
];

const filterFieldClass =
  "flex min-w-0 flex-col gap-1.5 text-sm xl:min-w-[9.5rem]";

export function BlotterToolbar({
  filters,
  totalCount,
  filteredCount,
  refreshing,
  onFiltersChange,
  onRefresh,
  onExport,
  onNewTrade,
}: BlotterToolbarProps) {
  const hasActiveFilters =
    filters.symbol.trim() !== "" ||
    filters.trader.trim() !== "" ||
    filters.side !== "ALL" ||
    filters.status !== "ALL" ||
    filters.sortKey !== "tradeTimestamp" ||
    filters.sortDirection !== "desc";

  function update<K extends keyof BlotterFilters>(key: K, value: BlotterFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="panel mb-3 p-3 sm:mb-4 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Symbol
          </span>
          <input
            type="search"
            className="field-input"
            placeholder="Filter by symbol"
            value={filters.symbol}
            onChange={(event) => update("symbol", event.target.value)}
            aria-label="Filter trades by symbol"
          />
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Trader
          </span>
          <input
            type="search"
            className="field-input uppercase"
            placeholder="Filter by trader"
            value={filters.trader}
            onChange={(event) => update("trader", event.target.value)}
            aria-label="Filter trades by trader"
          />
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Side
          </span>
          <select
            className="field-input"
            value={filters.side}
            onChange={(event) =>
              update("side", event.target.value as SideFilter)
            }
            aria-label="Filter trades by side"
          >
            <option value="ALL">All sides</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Status
          </span>
          <select
            className="field-input"
            value={filters.status}
            onChange={(event) =>
              update("status", event.target.value as StatusFilter)
            }
            aria-label="Filter trades by status"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Sort by
          </span>
          <select
            className="field-input"
            value={filters.sortKey}
            onChange={(event) =>
              update("sortKey", event.target.value as SortKey)
            }
            aria-label="Sort trades by column"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={filterFieldClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Order
          </span>
          <select
            className="field-input"
            value={filters.sortDirection}
            onChange={(event) =>
              update(
                "sortDirection",
                event.target.value as BlotterFilters["sortDirection"],
              )
            }
            aria-label="Sort order"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
        <p className="shrink-0 text-sm text-muted tabular-nums">
          Showing {filteredCount} of {totalCount}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn-secondary col-span-2 justify-center px-3 py-2 text-xs sm:col-span-1 sm:py-1.5"
              onClick={() =>
                onFiltersChange({
                  symbol: "",
                  trader: "",
                  side: "ALL",
                  status: "ALL",
                  sortKey: "tradeTimestamp",
                  sortDirection: "desc",
                })
              }
            >
              <FilterXIcon size={14} />
              Clear filters
            </button>
          ) : null}
          <button
            type="button"
            className="btn-secondary justify-center px-3 py-2 text-xs sm:py-1.5"
            onClick={onRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <RefreshIcon
              size={14}
              className={refreshing ? "animate-spin motion-reduce:animate-none" : undefined}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            className="btn-secondary justify-center px-3 py-2 text-xs sm:py-1.5"
            onClick={onExport}
            disabled={filteredCount === 0}
          >
            <DownloadIcon size={14} />
            <span className="sm:hidden">Export</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button"
            className="btn-primary col-span-2 justify-center px-3 py-2 text-xs sm:col-span-1 sm:py-1.5"
            onClick={onNewTrade}
          >
            <PlusIcon size={14} />
            New trade
          </button>
        </div>
      </div>
    </div>
  );
}
