"use client";

import { memo, useCallback, useState } from "react";
import type { TradeDto } from "@shared/api-contracts";
import { InboxIcon, PlusIcon } from "@/components/common/Icons";
import { TradeCard, TradeRow } from "@/components/features/TradeRow";
import { CancelConfirmDialog } from "@/components/modals/CancelConfirmDialog";

interface TradeTableProps {
  trades: TradeDto[];
  totalCount?: number;
  recentIds: Set<string>;
  onEdit: (trade: TradeDto) => void;
  onCancel: (id: string) => Promise<TradeDto>;
  onNewTrade: () => void;
  cancellingId?: string | null;
  hasFilters?: boolean;
}

function TradeTableSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="panel h-14 animate-pulse bg-nav-wash motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function TradeTableComponent({
  trades,
  totalCount,
  recentIds,
  onEdit,
  onCancel,
  onNewTrade,
  cancellingId,
  hasFilters = false,
}: TradeTableProps) {
  const [pendingCancel, setPendingCancel] = useState<TradeDto | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelRequest = useCallback((trade: TradeDto) => {
    setCancelError(null);
    setPendingCancel(trade);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (!pendingCancel) {
      return;
    }

    setCancelError(null);

    try {
      await onCancel(pendingCancel.id);
      setPendingCancel(null);
    } catch (cancelError) {
      setCancelError(
        cancelError instanceof Error
          ? cancelError.message
          : "Failed to cancel trade",
      );
    }
  }, [onCancel, pendingCancel]);

  const handleCancelDismiss = useCallback(() => {
    if (cancellingId) {
      return;
    }
    setPendingCancel(null);
    setCancelError(null);
  }, [cancellingId]);

  if (trades.length === 0) {
    return (
      <div className="panel p-6 text-center sm:p-8">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-nav-wash text-muted">
          <InboxIcon size={18} />
        </div>
        <p className="font-medium text-foreground">
          {hasFilters ? "No trades match your filters." : "No trades yet."}
        </p>
        <p className="mt-1 text-sm font-normal text-muted">
          {hasFilters
            ? "Try clearing filters or adjusting your search."
            : "Use New trade to add one. Updates appear here in real time."}
        </p>
        {!hasFilters ? (
          <button type="button" className="btn-primary mt-4" onClick={onNewTrade}>
            <PlusIcon size={14} />
            New trade
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="panel table-scroll hidden max-h-[65vh] overflow-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Live equity trade blotter with {totalCount ?? trades.length} trades
          </caption>
          <thead className="sticky top-0 z-1 bg-surface-raised">
            <tr className="border-b border-border text-xs font-normal uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-3 font-normal">
                ID
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Symbol
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Side
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Quantity
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Trader
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Book
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Timestamp
              </th>
              <th scope="col" className="px-4 py-3 font-normal">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <TradeRow
                key={trade.id}
                trade={trade}
                isRecent={recentIds.has(trade.id)}
                cancelling={cancellingId === trade.id}
                onEdit={onEdit}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2.5 md:hidden" role="list" aria-label="Trade cards">
        {trades.map((trade) => (
          <div key={trade.id} role="listitem">
            <TradeCard
              trade={trade}
              isRecent={recentIds.has(trade.id)}
              cancelling={cancellingId === trade.id}
              onEdit={onEdit}
              onCancelRequest={handleCancelRequest}
            />
          </div>
        ))}
      </div>

      <CancelConfirmDialog
        trade={pendingCancel}
        open={pendingCancel !== null}
        busy={pendingCancel !== null && cancellingId === pendingCancel.id}
        error={cancelError}
        onConfirm={() => void handleCancelConfirm()}
        onCancel={handleCancelDismiss}
      />
    </>
  );
}

export const TradeTable = memo(TradeTableComponent);
export { TradeTableSkeleton };
