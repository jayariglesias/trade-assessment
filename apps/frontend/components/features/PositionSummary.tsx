"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/Icons";
import type { SymbolPosition } from "@/lib/trades";

const PAGE_SIZE = 8;

interface PositionSummaryProps {
  positions: SymbolPosition[];
  highlightSymbols?: Set<string>;
}

export function PositionSummary({
  positions,
  highlightSymbols,
}: PositionSummaryProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const ordered = useMemo(() => {
    const highlighted = highlightSymbols?.size
      ? positions.filter((position) => highlightSymbols.has(position.symbol))
      : [];
    const remaining = highlightSymbols?.size
      ? positions.filter((position) => !highlightSymbols.has(position.symbol))
      : positions;
    return [...highlighted, ...remaining];
  }, [highlightSymbols, positions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toUpperCase();
    if (!needle) {
      return ordered;
    }
    return ordered.filter((position) =>
      position.symbol.toUpperCase().includes(needle),
    );
  }, [ordered, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const from =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [query, positions.length]);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  useEffect(() => {
    if (!highlightSymbols?.size || query.trim()) {
      return;
    }
    setPage(1);
  }, [highlightSymbols, query]);

  if (positions.length === 0) {
    return null;
  }

  return (
    <section className="panel p-3 sm:p-4" aria-labelledby="positions-heading">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="positions-heading"
            className="text-sm font-medium text-foreground"
          >
            Net positions
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Active buy and sell totals by symbol
          </p>
        </div>
        <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm sm:w-56">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Search symbol
          </span>
          <input
            type="search"
            className="field-input"
            placeholder="e.g. AAPL or TEST"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search net positions by symbol"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg bg-nav-wash px-3 py-4 text-center text-sm text-muted">
          No symbols match "{query.trim()}".
        </p>
      ) : (
        <>
          <ul className="space-y-2 sm:hidden" aria-label="Net positions">
            {paged.map((position) => {
              const isRecent =
                highlightSymbols?.has(position.symbol) ?? false;
              return (
                <li
                  key={position.symbol}
                  className={`rounded-md border border-border px-3 py-2.5 ${isRecent ? "trade-row-new bg-highlight/40" : "bg-nav-wash/50"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium tracking-wide">{position.symbol}</p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        position.netQuantity >= 0 ? "text-buy" : "text-sell"
                      }`}
                    >
                      Net {position.netQuantity.toLocaleString()}
                    </p>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted">Buy</dt>
                      <dd className="tabular-nums text-buy">
                        {position.buyQuantity.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Sell</dt>
                      <dd className="tabular-nums text-sell">
                        {position.sellQuantity.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>

          <div className="table-scroll hidden overflow-x-auto sm:block">
            <table className="w-full min-w-md border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-normal uppercase tracking-wide text-muted">
                  <th scope="col" className="pb-2 pr-4 font-normal">
                    Symbol
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-normal">
                    Buy
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-normal">
                    Sell
                  </th>
                  <th scope="col" className="pb-2 font-normal">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((position) => {
                  const isRecent =
                    highlightSymbols?.has(position.symbol) ?? false;
                  return (
                    <tr
                      key={position.symbol}
                      className={`border-b border-border/70 last:border-0 ${isRecent ? "trade-row-new" : ""}`}
                    >
                      <th
                        scope="row"
                        className="py-2.5 pr-4 font-medium tracking-wide"
                      >
                        {position.symbol}
                      </th>
                      <td className="py-2.5 pr-4 tabular-nums text-buy">
                        {position.buyQuantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-sell">
                        {position.sellQuantity.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 tabular-nums font-medium ${
                          position.netQuantity >= 0 ? "text-buy" : "text-sell"
                        }`}
                      >
                        {position.netQuantity.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted tabular-nums sm:text-left">
              Showing {from}-{to} of {filtered.length}
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
              <button
                type="button"
                className="btn-secondary justify-center px-2.5 py-2 text-xs sm:py-1.5"
                onClick={() => setPage((current) => current - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous positions page"
              >
                <ChevronLeftIcon size={14} />
                Prev
              </button>
              <span className="text-center text-xs text-muted tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary justify-center px-2.5 py-2 text-xs sm:py-1.5"
                onClick={() => setPage((current) => current + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next positions page"
              >
                Next
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
