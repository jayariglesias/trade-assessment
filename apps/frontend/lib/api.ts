import { createApiClient } from "@shared/api-contracts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = createApiClient(apiUrl);

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (!error || typeof error !== "object") {
    return fallback;
  }

  if ("message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    ) {
      return message.join(" ");
    }
  }

  return fallback;
}
