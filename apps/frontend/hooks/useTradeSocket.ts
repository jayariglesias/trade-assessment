"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { TradeDto } from "@shared/api-contracts";

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

interface TradeSocketHandlers {
  onCreated?: (trade: TradeDto) => void;
  onUpdated?: (trade: TradeDto) => void;
  onReconnect?: () => void;
}

export function useTradeSocket(handlers: TradeSocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const client = getSocket();

    const onCreated = (trade: TradeDto) => handlersRef.current.onCreated?.(trade);
    const onUpdated = (trade: TradeDto) => handlersRef.current.onUpdated?.(trade);
    const onReconnect = () => handlersRef.current.onReconnect?.();

    client.on("trade_created", onCreated);
    client.on("trade_updated", onUpdated);
    client.io.on("reconnect", onReconnect);

    return () => {
      client.off("trade_created", onCreated);
      client.off("trade_updated", onUpdated);
      client.io.off("reconnect", onReconnect);
    };
  }, []);
}

export function useSocketStatus(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const client = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    setConnected(client.connected);
    client.on("connect", onConnect);
    client.on("disconnect", onDisconnect);

    return () => {
      client.off("connect", onConnect);
      client.off("disconnect", onDisconnect);
    };
  }, []);

  return connected;
}
