import { LayoutGrid, Rows3 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '@/components/product/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { SortSelect } from '@/components/product/SortSelect'
import { useCategories, useProductsPage } from '@/features/catalog/queries'
import { useProductFilterState } from '@/features/catalog/useProductFilterState'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

export default function ShopPage() {
  const { data: categories = [] } = useCategories()
  const { sort, page, setSort, setPage } = useProductFilterState()
  const [compact, setCompact] = useState(false)

  const productsQuery = useProductsPage({ sort, page, pageSize: PAGE_SIZE })

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">Shop All</h1>
        <p className="mt-2 text-sand-600">Every category, in one place. Jump straight to an aisle:</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="group rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-sand-700 shadow-card transition-all hover:-translate-y-0.5 hover:border-brass-400 hover:text-brand-800 hover:shadow-lift"
          >
            {category.name}
            <span className="mt-0.5 block text-[0.6875rem] font-medium text-sand-400 transition-colors group-hover:text-brass-600">
              Browse →
            </span>
          </Link>
        ))}
      </div>

      {/* Sticky results toolbar */}
      <div className="sticky top-31 z-20 -mx-1 mb-6 flex items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white/95 px-4 py-2.5 shadow-card backdrop-blur-md">
        <p className="text-sm font-semibold text-sand-700">
          {productsQuery.data?.total ?? 0} <span className="font-normal text-sand-500">products</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg bg-sand-100 p-0.5 sm:flex" role="group" aria-label="Grid density">
            <button
              type="button"
              onClick={() => setCompact(false)}
              aria-pressed={!compact}
              aria-label="Comfortable grid"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                !compact ? 'bg-white text-brand-800 shadow-card' : 'text-sand-500 hover:text-sand-700',
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCompact(true)}
              aria-pressed={compact}
              aria-label="Compact grid"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                compact ? 'bg-white text-brand-800 shadow-card' : 'text-sand-500 hover:text-sand-700',
              )}
            >
              <Rows3 className="size-4" />
            </button>
          </div>
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <ProductGrid
        products={productsQuery.data?.items}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        compact={compact}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={productsQuery.data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}
