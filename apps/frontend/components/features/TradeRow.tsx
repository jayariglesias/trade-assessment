import { memo, useCallback } from "react";
import type { TradeDto } from "@shared/api-contracts";
import { BanIcon, PencilIcon } from "@/components/common/Icons";

interface TradeRowProps {
  trade: TradeDto;
  isRecent: boolean;
  cancelling: boolean;
  onEdit: (trade: TradeDto) => void;
  onCancelRequest: (trade: TradeDto) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

function TradeRowComponent({
  trade,
  isRecent,
  cancelling,
  onEdit,
  onCancelRequest,
}: TradeRowProps) {
  const isCancelled = trade.status === "CANCELLED";
  const handleEdit = useCallback(() => onEdit(trade), [onEdit, trade]);
  const handleCancel = useCallback(
    () => onCancelRequest(trade),
    [onCancelRequest, trade],
  );

  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-nav-wash ${isRecent ? "trade-row-new" : ""} ${isCancelled ? "opacity-60" : ""}`}
    >
      <td className="px-4 py-3 tabular-nums text-muted">{trade.id}</td>
      <td className="px-4 py-3 font-medium tracking-wide">{trade.symbol}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
            trade.side === "BUY"
              ? "bg-buy-bg text-buy"
              : "bg-sell-bg text-sell"
          }`}
        >
          {trade.side}
        </span>
      </td>
      <td className="px-4 py-3 tabular-nums text-foreground">
        {trade.quantity.toLocaleString()}
      </td>
      <td className="px-4 py-3 tabular-nums text-foreground">
        ${formatPrice(trade.price)}
      </td>
      <td className="px-4 py-3 text-foreground">{trade.trader}</td>
      <td className="px-4 py-3 text-muted">{trade.book}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
            trade.status === "ACTIVE"
              ? "bg-buy-bg text-buy"
              : "bg-nav-wash text-muted line-through decoration-muted/60"
          }`}
        >
          {trade.status}
        </span>
      </td>
      <td className="px-4 py-3 text-muted">
        {formatTimestamp(trade.tradeTimestamp)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-sm"
            onClick={handleEdit}
            disabled={isCancelled}
            aria-label={`Edit trade ${trade.id}, ${trade.symbol}`}
          >
            <PencilIcon size={14} />
            Edit
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={cancelling || isCancelled}
            onClick={handleCancel}
            aria-label={
              isCancelled
                ? `Trade ${trade.id} is already cancelled`
                : `Cancel trade ${trade.id}, ${trade.symbol}`
            }
          >
            <BanIcon size={14} />
            {cancelling ? "Cancelling..." : isCancelled ? "Cancelled" : "Cancel"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export const TradeRow = memo(TradeRowComponent);

interface TradeCardProps extends TradeRowProps {}

function TradeCardComponent({
  trade,
  isRecent,
  cancelling,
  onEdit,
  onCancelRequest,
}: TradeCardProps) {
  const isCancelled = trade.status === "CANCELLED";
  const handleEdit = useCallback(() => onEdit(trade), [onEdit, trade]);
  const handleCancel = useCallback(
    () => onCancelRequest(trade),
    [onCancelRequest, trade],
  );

  return (
    <article
      className={`panel p-3.5 sm:p-4 ${isRecent ? "trade-row-new" : ""} ${isCancelled ? "opacity-60" : ""}`}
      aria-label={`Trade ${trade.id}, ${trade.symbol}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{trade.id}</p>
          <p className="text-lg font-semibold tracking-wide">{trade.symbol}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
              trade.side === "BUY" ? "bg-buy-bg text-buy" : "bg-sell-bg text-sell"
            }`}
          >
            {trade.side}
          </span>
          <span
            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
              trade.status === "ACTIVE"
                ? "bg-buy-bg text-buy"
                : "bg-nav-wash text-muted line-through decoration-muted/60"
            }`}
          >
            {trade.status}
          </span>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div>
          <dt className="text-xs text-muted">Quantity</dt>
          <dd className="tabular-nums font-medium">
            {trade.quantity.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Price</dt>
          <dd className="tabular-nums font-medium">${formatPrice(trade.price)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Trader</dt>
          <dd className="truncate">{trade.trader}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Book</dt>
          <dd className="truncate text-muted">{trade.book}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted">Counterparty</dt>
          <dd className="truncate text-muted">{trade.counterparty}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted">Timestamp</dt>
          <dd className="text-muted">{formatTimestamp(trade.tradeTimestamp)}</dd>
        </div>
      </dl>

      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-secondary justify-center px-3 py-2.5 text-sm"
          onClick={handleEdit}
          disabled={isCancelled}
          aria-label={`Edit trade ${trade.id}, ${trade.symbol}`}
        >
          <PencilIcon size={14} />
          Edit
        </button>
        <button
          type="button"
          className="btn-danger justify-center px-3 py-2.5"
          disabled={cancelling || isCancelled}
          onClick={handleCancel}
          aria-label={
            isCancelled
              ? `Trade ${trade.id} is already cancelled`
              : `Cancel trade ${trade.id}, ${trade.symbol}`
          }
        >
          <BanIcon size={14} />
          {cancelling ? "Cancelling..." : isCancelled ? "Cancelled" : "Cancel"}
        </button>
      </div>
    </article>
  );
}

export const TradeCard = memo(TradeCardComponent);
