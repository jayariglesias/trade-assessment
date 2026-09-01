"use client";

interface LiveIndicatorProps {
  connected: boolean;
  compact?: boolean;
}

export function LiveIndicator({
  connected,
  compact = false,
}: LiveIndicatorProps) {
  const label = connected ? "Live feed connected" : "Reconnecting to live feed";

  return (
    <div
      className={`flex items-center gap-2 text-xs text-muted ${compact ? "" : "rounded-md border border-border bg-surface-raised px-3 py-1.5"}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          connected ? "bg-live live-pulse" : "bg-muted"
        }`}
        aria-hidden
      />
      <span>
        {connected ? (compact ? "Live" : "Live feed") : "Reconnecting"}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
