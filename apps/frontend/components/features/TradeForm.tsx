"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { CreateTradeDto, TradeDto, TradeSide } from "@shared/api-contracts";

interface TradeFormProps {
  initialTrade?: TradeDto | null;
  embedded?: boolean;
  onSubmit: (input: CreateTradeDto) => Promise<void>;
  onCancel?: () => void;
}

const emptyForm: CreateTradeDto = {
  symbol: "",
  quantity: 1,
  price: 0,
  side: "BUY",
  trader: "",
  tradeDate: new Date().toISOString().slice(0, 10),
  book: "",
  counterparty: "",
};

export function TradeForm({
  initialTrade,
  embedded = false,
  onSubmit,
  onCancel,
}: TradeFormProps) {
  const formId = useId();
  const errorId = `${formId}-error`;
  const [form, setForm] = useState<CreateTradeDto>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTrade) {
      setForm({
        symbol: initialTrade.symbol,
        quantity: initialTrade.quantity,
        price: initialTrade.price,
        side: initialTrade.side,
        trader: initialTrade.trader,
        tradeDate: initialTrade.tradeDate,
        book: initialTrade.book,
        counterparty: initialTrade.counterparty,
      });
    } else {
      setForm({
        ...emptyForm,
        tradeDate: new Date().toISOString().slice(0, 10),
      });
    }
    setError(null);
  }, [initialTrade]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        symbol: form.symbol.trim().toUpperCase(),
        quantity: Number(form.quantity),
        price: Number(form.price),
        side: form.side,
        trader: form.trader.trim().toUpperCase(),
        tradeDate: form.tradeDate,
        book: form.book.trim(),
        counterparty: form.counterparty.trim(),
      });
      if (!initialTrade) {
        setForm({
          ...emptyForm,
          tradeDate: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save trade",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={embedded ? undefined : "panel p-6"}
      onSubmit={handleSubmit}
      aria-busy={submitting}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label
          htmlFor={`${formId}-symbol`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Symbol
          <input
            id={`${formId}-symbol`}
            type="text"
            className="field-input uppercase"
            value={form.symbol}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                symbol: event.target.value.toUpperCase(),
              }))
            }
            placeholder="AAPL"
            maxLength={10}
            required
            autoComplete="off"
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-side`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Side
          <select
            id={`${formId}-side`}
            className="field-input"
            value={form.side}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                side: event.target.value as TradeSide,
              }))
            }
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </label>

        <label
          htmlFor={`${formId}-trader`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Trader
          <input
            id={`${formId}-trader`}
            type="text"
            className="field-input uppercase"
            value={form.trader}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                trader: event.target.value.toUpperCase(),
              }))
            }
            placeholder="JSMITH"
            maxLength={20}
            required
            autoComplete="off"
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-quantity`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Quantity
          <input
            id={`${formId}-quantity`}
            type="number"
            className="field-input tabular-nums"
            min={1}
            step={1}
            inputMode="numeric"
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                quantity: Number(event.target.value),
              }))
            }
            required
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-price`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Price
          <input
            id={`${formId}-price`}
            type="number"
            className="field-input tabular-nums"
            min={0.01}
            step={0.01}
            inputMode="decimal"
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                price: Number(event.target.value),
              }))
            }
            required
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-tradeDate`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Trade date
          <input
            id={`${formId}-tradeDate`}
            type="date"
            className="field-input"
            value={form.tradeDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                tradeDate: event.target.value,
              }))
            }
            required
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-book`}
          className="flex flex-col gap-1.5 text-sm text-muted"
        >
          Book
          <input
            id={`${formId}-book`}
            type="text"
            className="field-input"
            value={form.book}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                book: event.target.value,
              }))
            }
            placeholder="EQUITIES_UK"
            maxLength={40}
            required
            autoComplete="off"
            aria-required="true"
          />
        </label>

        <label
          htmlFor={`${formId}-counterparty`}
          className="flex flex-col gap-1.5 text-sm text-muted sm:col-span-2"
        >
          Counterparty
          <input
            id={`${formId}-counterparty`}
            type="text"
            className="field-input"
            value={form.counterparty}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                counterparty: event.target.value,
              }))
            }
            placeholder="Goldman Sachs"
            maxLength={60}
            required
            autoComplete="off"
            aria-required="true"
          />
        </label>
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-4 text-sm text-error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
        {onCancel ? (
          <button
            type="button"
            className="btn-secondary w-full justify-center py-2.5 sm:w-auto sm:py-2"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="btn-primary w-full justify-center py-2.5 sm:w-auto sm:py-2"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : initialTrade
              ? "Update Trade"
              : "Create Trade"}
        </button>
      </div>
    </form>
  );
}
