import React from "react";

// Shared table pagination.
//
// Built once rather than per-table so page size, the "showing X to Y of Z"
// line and the reset-on-filter-change rule stay identical everywhere. The
// reset is the part that bites: sitting on page 3 and switching to a tab with
// one page of results leaves you staring at an empty table that looks broken.
// usePagination() below owns that, so a caller cannot forget it.

export const DEFAULT_PAGE_SIZE = 10;

interface Props {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize?: (n: number) => void;
  /** e.g. "invoices" — used in the "showing 1 to 10 of 42 invoices" line. */
  label?: string;
}

/** Page numbers to render: always the first, the last, and a window around the current one. */
function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | "gap")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < pageCount - 1) out.push("gap");
  out.push(pageCount);
  return out;
}

const Pagination: React.FC<Props> = ({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
  onPageSize,
  label = "records",
}) => {
  // One page of results needs no controls, but the count is still useful.
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted" style={{ fontSize: 13 }}>
          Showing {first} to {last} of {total} {label}
        </span>
        {onPageSize && (
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {pageCount > 1 && (
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
          </li>
          {pageItems(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <li className="page-item disabled" key={`gap${i}`}>
                <span className="page-link">…</span>
              </li>
            ) : (
              <li className={`page-item ${p === page ? "active" : ""}`} key={p}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPage(p)}
                >
                  {p}
                </button>
              </li>
            )
          )}
          <li className={`page-item ${page === pageCount ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPage(page + 1)}
              disabled={page === pageCount}
            >
              Next
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Pagination;

/**
 * Slices a list into pages and keeps the page number honest.
 *
 * `resetKey` is whatever the caller considers a new result set — the active
 * tab, a search term, a status filter. When it changes the page returns to 1.
 * Without that you can be on page 3, switch to a tab with 4 rows, and see an
 * empty table.
 *
 * The page is also clamped on every render, so a list that shrinks underneath
 * you (a row deleted, a filter narrowed) can never strand you past the end.
 */
export function usePagination<T>(
  rows: T[],
  resetKey: unknown,
  initialSize: number = DEFAULT_PAGE_SIZE
) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialSize);

  React.useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  // Correct the stored page when it has drifted past the end, so the controls
  // and the rows never disagree about which page is showing.
  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, pageSize, pageCount, total, pageRows, setPage, setPageSize };
}
