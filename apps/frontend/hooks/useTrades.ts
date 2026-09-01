"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TradeDto } from "@shared/api-contracts";
import { cancelTrade, listTrades } from "@/app/home/actions";
import { useTradeSocket } from "@/hooks/useTradeSocket";

function tradesEqual(a: TradeDto, b: TradeDto): boolean {
  return (
    a.id === b.id &&
    a.symbol === b.symbol &&
    a.side === b.side &&
    a.quantity === b.quantity &&
    a.price === b.price &&
    a.trader === b.trader &&
    a.tradeDate === b.tradeDate &&
    a.status === b.status &&
    a.book === b.book &&
    a.counterparty === b.counterparty &&
    a.tradeTimestamp === b.tradeTimestamp
  );
}

export function useTrades() {
  const [trades, setTrades] = useState<TradeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<Set<string>>(() => new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const markRecent = useCallback((id: string) => {
    setRecentIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    const existing = highlightTimers.current.get(id);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      setRecentIds((current) => {
        if (!current.has(id)) {
          return current;
        }
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      highlightTimers.current.delete(id);
    }, 2500);

    highlightTimers.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timers = highlightTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const loadTrades = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const data = await listTrades();
      setTrades(data);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load trades",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades]);

  const onCreated = useCallback(
    (trade: TradeDto) => {
      let added = false;
      setTrades((current) => {
        if (current.some((item) => item.id === trade.id)) {
          return current;
        }
        added = true;
        return [trade, ...current];
      });

      if (added) {
        markRecent(trade.id);
      }
    },
    [markRecent],
  );

  const onUpdated = useCallback(
    (trade: TradeDto) => {
      let changed = false;
      setTrades((current) =>
        current.map((item) => {
          if (item.id !== trade.id) {
            return item;
          }
          if (tradesEqual(item, trade)) {
            return item;
          }
          changed = true;
          return trade;
        }),
      );

      if (changed) {
        markRecent(trade.id);
      }
    },
    [markRecent],
  );

  const onReconnect = useCallback(() => {
    void loadTrades(true);
    setLiveMessage("Live feed reconnected. Blotter refreshed.");
  }, [loadTrades]);

  const refreshTrades = useCallback(async () => {
    await loadTrades(true);
  }, [loadTrades]);

  useTradeSocket({ onCreated, onUpdated, onReconnect });

  const cancelTradeById = useCallback(
    async (id: string): Promise<TradeDto> => {
      setCancellingId(id);
      try {
        const trade = await cancelTrade(id);
        setTrades((current) =>
          current.map((item) => (item.id === id ? trade : item)),
        );
        markRecent(trade.id);
        return trade;
      } finally {
        setCancellingId(null);
      }
    },
    [markRecent],
  );

  const upsertTrade = useCallback(
    (trade: TradeDto) => {
      setTrades((current) => {
        const index = current.findIndex((item) => item.id === trade.id);
        if (index === -1) {
          return [trade, ...current];
        }
        const next = [...current];
        next[index] = trade;
        return next;
      });
      markRecent(trade.id);
    },
    [markRecent],
  );

  return {
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
  };
}
