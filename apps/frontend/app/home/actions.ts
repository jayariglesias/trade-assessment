import type { CreateTradeDto, UpdateTradeDto } from "@shared/api-contracts";
import { api, apiErrorMessage } from "@/lib/api";

export async function listTrades() {
  const { data, error } = await api.GET("/trades");
  if (error) {
    throw new Error(apiErrorMessage(error, "Failed to load trades"));
  }
  return data ?? [];
}

export async function cancelTrade(id: string) {
  const { data, error } = await api.PATCH("/trades/{id}/cancel", {
    params: { path: { id } },
  });
  if (error || !data) {
    throw new Error(apiErrorMessage(error, "Failed to cancel trade"));
  }
  return data;
}

export async function createTrade(body: CreateTradeDto) {
  const { data, error } = await api.POST("/trades", { body });
  if (error || !data) {
    throw new Error(apiErrorMessage(error, "Failed to create trade"));
  }
  return data;
}

export async function updateTrade(id: string, body: UpdateTradeDto) {
  const { data, error } = await api.PUT("/trades/{id}", {
    params: { path: { id } },
    body,
  });
  if (error || !data) {
    throw new Error(apiErrorMessage(error, "Failed to update trade"));
  }
  return data;
}
