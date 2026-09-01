import type { ReactNode } from "react";
import {
  ActivityIcon,
  LayersIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "@/components/common/Icons";

interface BlotterStatsProps {
  total: number;
  active: number;
  buy: number;
  sell: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  iconClassName: string;
  valueClassName?: string;
}

function StatCard({
  label,
  value,
  icon,
  iconClassName,
  valueClassName = "text-foreground",
}: StatCardProps) {
  return (
    <article
      className="panel flex min-h-24 flex-col justify-between gap-4 p-4 sm:min-h-28 sm:p-5"
      aria-label={`${label}: ${value.toLocaleString()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          aria-hidden
        >
          {icon}
        </div>
      </div>
      <p
        className={`text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${valueClassName}`}
      >
        {value.toLocaleString()}
      </p>
    </article>
  );
}

export function BlotterStats({ total, active, buy, sell }: BlotterStatsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      aria-label="Trade summary"
    >
      <StatCard
        label="Total trades"
        value={total}
        icon={<LayersIcon size={20} />}
        iconClassName="bg-nav-wash text-muted"
      />
      <StatCard
        label="Active"
        value={active}
        icon={<ActivityIcon size={20} />}
        iconClassName="bg-live-bg text-live"
      />
      <StatCard
        label="Buy"
        value={buy}
        icon={<TrendingUpIcon size={20} />}
        iconClassName="bg-buy-bg text-buy"
        valueClassName="text-buy"
      />
      <StatCard
        label="Sell"
        value={sell}
        icon={<TrendingDownIcon size={20} />}
        iconClassName="bg-sell-bg text-sell"
        valueClassName="text-sell"
      />
    </div>
  );
}
