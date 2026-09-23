import { ChevronLeft, ChevronRight } from 'lucide-react'

type PageItem = number | 'gap'

function buildPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: PageItem[] = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(totalPages - 1, page + 1)
  if (from > 2) items.push('gap')
  for (let p = from; p <= to; p++) items.push(p)
  if (to < totalPages - 1) items.push('gap')
  items.push(totalPages)
  return items
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Product pages"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-10 items-center justify-center rounded-lg border border-sand-300 text-sand-700 transition-colors hover:border-brand-600 hover:text-brand-800 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {buildPageItems(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="flex size-10 items-end justify-center pb-2.5 text-sm text-sand-400"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={
              item === page
                ? 'flex size-10 items-center justify-center rounded-lg border border-brand-800 bg-brand-800 text-sm font-bold text-white shadow-card'
                : 'flex size-10 items-center justify-center rounded-lg border border-sand-300 text-sm font-semibold text-sand-700 transition-colors hover:border-brand-600 hover:text-brand-800'
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex size-10 items-center justify-center rounded-lg border border-sand-300 text-sand-700 transition-colors hover:border-brand-600 hover:text-brand-800 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
