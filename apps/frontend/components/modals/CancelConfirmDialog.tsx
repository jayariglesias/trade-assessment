"use client";

import { useEffect, useRef } from "react";
import type { TradeDto } from "@shared/api-contracts";
import {
  AlertTriangleIcon,
  BanIcon,
  LoaderIcon,
} from "@/components/common/Icons";

interface CancelConfirmDialogProps {
  trade: TradeDto | null;
  open: boolean;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTradeSummary(trade: TradeDto): string {
  return `${trade.side} ${trade.quantity.toLocaleString()} ${trade.symbol} at $${formatPrice(trade.price)}`;
}

export function CancelConfirmDialog({
  trade,
  open,
  busy,
  error,
  onConfirm,
  onCancel,
}: CancelConfirmDialogProps) {
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      dismissRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, open, onCancel]);

  if (!open || !trade) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-lg border border-border bg-surface-raised shadow-lg sm:rounded-lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-desc"
        aria-busy={busy}
      >
        <div className="border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sell-bg text-sell">
              <AlertTriangleIcon size={18} />
            </div>
            <div>
              <h2 id="cancel-dialog-title" className="text-base font-semibold">
                Cancel this trade?
              </h2>
              <p
                id="cancel-dialog-desc"
                className="mt-1 text-sm font-normal text-muted"
              >
                The trade stays in the blotter with a cancelled status. This
                cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="rounded-lg border border-border bg-nav-wash/40 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Trade summary
            </p>
            <p className="mt-1 font-medium tracking-wide">{trade.symbol}</p>
            <p className="mt-0.5 text-sm text-muted">
              {formatTradeSummary(trade)}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">ID</dt>
                <dd className="tabular-nums text-muted">{trade.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Trader</dt>
                <dd>{trade.trader}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted">Book</dt>
                <dd className="text-muted">{trade.book}</dd>
              </div>
            </dl>
          </div>

          {error ? (
            <p
              className="rounded-lg border border-sell/30 bg-sell-bg px-3 py-2 text-sm text-sell"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-5">
          <button
            ref={dismissRef}
            type="button"
            className="btn-secondary w-full justify-center px-3 py-2.5 text-sm sm:w-auto sm:py-1.5"
            onClick={onCancel}
            disabled={busy}
          >
            Keep active
          </button>
          <button
            type="button"
            className="btn-danger w-full justify-center px-4 py-2.5 text-sm sm:w-auto sm:py-1.5"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <LoaderIcon
                size={14}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <BanIcon size={14} />
            )}
            {busy ? "Cancelling..." : "Yes, cancel trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
