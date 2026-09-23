import { SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FilterPanel } from '@/components/product/FilterPanel'
import { Pagination } from '@/components/product/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { SortSelect } from '@/components/product/SortSelect'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCategoryAttributes,
  useCategoryBySlug,
  useProductsPage,
} from '@/features/catalog/queries'
import { useProductFilterState } from '@/features/catalog/useProductFilterState'
import { useDocumentHead } from '@/hooks/useDocumentHead'

const PAGE_SIZE = 12

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const { data: category, isLoading: categoryLoading, isError: categoryError } = useCategoryBySlug(slug)
  const { data: attributes = [] } = useCategoryAttributes(category?.id)
  const { filters, sort, page, setSort, setPage, toggleSelectValue, toggleBoolean, clearAll, activeFilterCount } =
    useProductFilterState()

  const productsQuery = useProductsPage({
    categoryId: category?.id,
    filters,
    sort,
    page,
    pageSize: PAGE_SIZE,
  })

  useDocumentHead({
    title: category ? `${category.name} — Laghara Hardwares` : 'Category — Laghara Hardwares',
    description: category?.description ?? undefined,
  })

  // Quick-commerce behavior: after a page change, snap the grid back into view
  // instead of leaving the viewport at the bottom where the click happened.
  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage)
      const el = gridRef.current
      const y = el ? el.getBoundingClientRect().top + window.scrollY - 110 : 0
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    },
    [setPage],
  )

  if (categoryLoading) {
    return (
      <div className="container-page py-16">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  if (categoryError || !category) {
    return <Navigate to="/shop" replace />
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-sand-500">
        <Link to="/" className="hover:text-brand-700">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-700">
          Shop
        </Link>
        <span>/</span>
        <span className="text-sand-700">{category.name}</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sand-600">{category.description}</p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-31 max-h-[calc(100vh-9rem)] overflow-y-auto">
            <FilterPanel
              attributes={attributes}
              filters={filters}
              onToggleSelect={toggleSelectValue}
              onToggleBoolean={toggleBoolean}
              onClear={clearAll}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        <div>
          <div className="sticky top-31 z-20 -mx-1 mb-6 flex items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white/95 px-4 py-2.5 shadow-card backdrop-blur-md">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-sand-300 px-3.5 py-2 text-sm font-bold text-sand-700 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-brass-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <p className="text-sm font-semibold text-sand-700">
              {productsQuery.data?.total ?? 0} <span className="font-normal text-sand-500">products</span>
            </p>
            <div className="ml-auto">
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <div ref={gridRef} />
          <ProductGrid
            products={productsQuery.data?.items}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            isFetching={productsQuery.isFetching && !productsQuery.isLoading}
          />

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={productsQuery.data?.total ?? 0}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-sand-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 hover:bg-sand-100"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            <FilterPanel
              attributes={attributes}
              filters={filters}
              onToggleSelect={toggleSelectValue}
              onToggleBoolean={toggleBoolean}
              onClear={clearAll}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
