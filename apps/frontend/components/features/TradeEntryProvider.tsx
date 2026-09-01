"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TradeDto } from "@shared/api-contracts";
import {
  BanIcon,
  CheckIcon,
  XIcon,
} from "@/components/common/Icons";
import { TradeEntryModal } from "@/components/modals/TradeEntryModal";

export type NoticeVariant = "success" | "cancel" | "info";
export type TradeSaveAction = "created" | "updated";

interface NoticeState {
  message: string;
  variant: NoticeVariant;
}

type TradeSavedHandler = (trade: TradeDto, action: TradeSaveAction) => void;

interface TradeEntryContextValue {
  openCreate: () => void;
  openEdit: (trade: TradeDto) => void;
  showNotice: (message: string, variant?: NoticeVariant) => void;
  setOnTradeSaved: (handler: TradeSavedHandler | null) => void;
}

const TradeEntryContext = createContext<TradeEntryContextValue | null>(null);

const NOTICE_DURATION_MS = 5000;

const noticeStyles: Record<NoticeVariant, string> = {
  success: "border-buy/30 bg-buy-bg text-buy",
  cancel: "border-sell/30 bg-sell-bg text-sell",
  info: "border-border bg-surface-raised text-foreground",
};

function NoticeIcon({ variant }: { variant: NoticeVariant }) {
  if (variant === "cancel") {
    return <BanIcon size={16} className="mt-0.5 shrink-0" />;
  }

  return <CheckIcon size={16} className="mt-0.5 shrink-0" />;
}

export function TradeEntryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [trade, setTrade] = useState<TradeDto | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTradeSavedRef = useRef<TradeSavedHandler | null>(null);

  const clearNoticeTimer = useCallback(() => {
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
      noticeTimer.current = null;
    }
  }, []);

  const dismissNotice = useCallback(() => {
    clearNoticeTimer();
    setNotice(null);
  }, [clearNoticeTimer]);

  const showNotice = useCallback(
    (message: string, variant: NoticeVariant = "success") => {
      clearNoticeTimer();
      setNotice({ message, variant });
      noticeTimer.current = setTimeout(() => {
        setNotice(null);
        noticeTimer.current = null;
      }, NOTICE_DURATION_MS);
    },
    [clearNoticeTimer],
  );

  const setOnTradeSaved = useCallback((handler: TradeSavedHandler | null) => {
    onTradeSavedRef.current = handler;
  }, []);

  const notifyTradeSaved = useCallback(
    (saved: TradeDto, action: TradeSaveAction) => {
      onTradeSavedRef.current?.(saved, action);
    },
    [],
  );

  useEffect(() => {
    return () => {
      clearNoticeTimer();
    };
  }, [clearNoticeTimer]);

  const openCreate = useCallback(() => {
    setTrade(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((next: TradeDto) => {
    setTrade(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setTrade(null);
  }, []);

  const value = useMemo(
    () => ({ openCreate, openEdit, showNotice, setOnTradeSaved }),
    [openCreate, openEdit, showNotice, setOnTradeSaved],
  );

  return (
    <TradeEntryContext.Provider value={value}>
      {children}
      <TradeEntryModal
        open={open}
        trade={trade}
        onClose={close}
        onTradeSaved={notifyTradeSaved}
      />
      {notice ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:px-4 sm:pb-0">
          <div
            className={`pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${noticeStyles[notice.variant]}`}
            role="status"
            aria-live="polite"
          >
            <NoticeIcon variant={notice.variant} />
            <p className="flex-1 font-normal">{notice.message}</p>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 transition-colors hover:bg-nav-wash"
              onClick={dismissNotice}
              aria-label="Dismiss notification"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </TradeEntryContext.Provider>
  );
}

export function useTradeEntry() {
  const context = useContext(TradeEntryContext);
  if (!context) {
    throw new Error("useTradeEntry must be used within TradeEntryProvider");
  }
  return context;
}
