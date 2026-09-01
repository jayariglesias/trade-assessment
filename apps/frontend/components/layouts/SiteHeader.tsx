"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiveIndicator } from "@/components/common/LiveIndicator";
import {
  ListIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from "@/components/common/Icons";
import { useTheme } from "@/components/common/ThemeProvider";
import { useTradeEntry } from "@/components/features/TradeEntryProvider";
import { useSocketStatus } from "@/hooks/useTradeSocket";

function navClassName(active: boolean): string {
  return active
    ? "inline-flex items-center gap-1.5 rounded-md bg-nav-wash px-2.5 py-2 font-medium text-foreground sm:px-3"
    : "inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted transition-colors hover:bg-nav-wash sm:px-3";
}

export function SiteHeader() {
  const pathname = usePathname();
  const connected = useSocketStatus();
  const { theme, mounted, toggleTheme } = useTheme();
  const { openCreate } = useTradeEntry();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight sm:text-base">
            Trade Fusion
          </p>
          <p className="truncate text-[0.65rem] font-medium uppercase tracking-wider text-muted sm:text-[0.7rem]">
            Equity blotter
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LiveIndicator connected={connected} compact />

          <button
            type="button"
            className="btn-secondary px-2.5 py-2 text-xs sm:px-3 sm:py-1.5"
            onClick={toggleTheme}
            aria-label={
              mounted
                ? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
                : "Switch theme"
            }
            suppressHydrationWarning
          >
            {mounted && theme === "dark" ? (
              <SunIcon size={14} />
            ) : (
              <MoonIcon size={14} />
            )}
            <span className="hidden sm:inline">
              {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
            </span>
          </button>

          <nav
            className="flex items-center gap-1 text-sm"
            aria-label="Main navigation"
          >
            <Link
              href="/home"
              className={navClassName(pathname === "/home")}
              aria-current={pathname === "/home" ? "page" : undefined}
              aria-label="Blotter"
            >
              <ListIcon size={14} />
              <span className="hidden sm:inline" aria-hidden>
                Blotter
              </span>
            </Link>
            <button
              type="button"
              className="btn-primary px-2.5 py-2 text-sm sm:px-3"
              onClick={openCreate}
            >
              <PlusIcon size={14} />
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New trade</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
