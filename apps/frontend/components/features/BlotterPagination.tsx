"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/Icons";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/trades";

interface BlotterPaginationProps {
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  totalItems: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export function BlotterPagination({
  currentPage,
  totalPages,
  from,
  to,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: BlotterPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <nav
      className="panel mt-3 flex flex-col gap-3 px-3 py-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:px-4"
      aria-label="Trade blotter pagination"
    >
      <p className="text-center text-sm text-muted sm:text-left">
        {totalItems <= pageSize
          ? `Showing all ${totalItems} trades`
          : `Showing ${from}-${to} of ${totalItems}`}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <label className="flex items-center justify-between gap-2 text-sm text-muted sm:justify-start">
          <span className="text-xs font-medium uppercase tracking-wide">
            Rows
          </span>
          <select
            className="field-input w-auto min-w-[4.5rem] py-1.5 text-sm"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as PageSize)
            }
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
          <button
            type="button"
            className="btn-secondary justify-center px-3 py-2 text-xs sm:py-1.5"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon size={14} />
            <span className="sm:hidden">Prev</span>
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="px-1 text-center text-sm text-muted tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary justify-center px-3 py-2 text-xs sm:py-1.5"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
