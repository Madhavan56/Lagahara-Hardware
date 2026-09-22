import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
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
    title: category ? `${category.name} — Dhuraj Interiors` : 'Category — Dhuraj Interiors',
    description: category?.description ?? undefined,
  })

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
      <nav className="mb-4 text-xs text-sand-500">
        <Link to="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/shop" className="hover:text-brand-700">
          Shop
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-sand-700">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sand-600">{category.description}</p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            attributes={attributes}
            filters={filters}
            onToggleSelect={toggleSelectValue}
            onToggleBoolean={toggleBoolean}
            onClear={clearAll}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-sand-300 px-3.5 py-2 text-sm font-medium text-sand-700 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-brand-800 px-1.5 py-0.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <p className="hidden text-sm text-sand-500 sm:block">
              {productsQuery.data?.total ?? 0} products
            </p>
            <div className="ml-auto">
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <ProductGrid
            products={productsQuery.data?.items}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
          />

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={productsQuery.data?.total ?? 0}
            onPageChange={setPage}
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
