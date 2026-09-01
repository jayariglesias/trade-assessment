"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CreateTradeDto, TradeDto } from "@shared/api-contracts";
import { createTrade, updateTrade } from "@/app/home/actions";
import { TradeForm } from "@/components/features/TradeForm";
import {
  useTradeEntry,
  type TradeSaveAction,
} from "@/components/features/TradeEntryProvider";

interface TradeEntryModalProps {
  open: boolean;
  trade: TradeDto | null;
  onClose: () => void;
  onTradeSaved: (trade: TradeDto, action: TradeSaveAction) => void;
}

function formatNoticeTrade(trade: TradeDto): string {
  return `${trade.id} · ${trade.side} ${trade.quantity.toLocaleString()} ${trade.symbol} at $${trade.price.toFixed(2)}`;
}

export function TradeEntryModal({
  open,
  trade,
  onClose,
  onTradeSaved,
}: TradeEntryModalProps) {
  const { showNotice } = useTradeEntry();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isEdit = trade !== null;
  const title = isEdit ? `Edit trade ${trade.id}` : "New trade";

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleSubmit = useCallback(
    async (input: CreateTradeDto) => {
      const saved = trade
        ? await updateTrade(trade.id, input)
        : await createTrade(input);
      const action: TradeSaveAction = trade ? "updated" : "created";

      onTradeSaved(saved, action);
      showNotice(
        action === "updated"
          ? `Trade updated: ${formatNoticeTrade(saved)}`
          : `Trade created: ${formatNoticeTrade(saved)}`,
      );
      onClose();
    },
    [onClose, onTradeSaved, showNotice, trade],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:overflow-y-auto sm:p-4"
      role="presentation"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-lg border border-border bg-surface-raised shadow-lg sm:my-4 sm:max-h-[85vh] sm:rounded-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-entry-title"
        aria-describedby="trade-entry-desc"
      >
        <div className="shrink-0 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
          <h2
            id="trade-entry-title"
            ref={titleRef}
            tabIndex={-1}
            className="text-base font-semibold outline-none"
          >
            {title}
          </h2>
          <p id="trade-entry-desc" className="mt-1 text-sm text-muted">
            All fields are required.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          <TradeForm
            embedded
            initialTrade={trade}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
