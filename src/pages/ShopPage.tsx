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

  const productsQuery = useProductsPage({ sort, page, pageSize: PAGE_SIZE })

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">Shop All</h1>
        <p className="mt-2 text-sand-600">Every category, in one place.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className={cn(
              'rounded-full border border-sand-300 px-3.5 py-1.5 text-sm text-sand-700 transition-colors hover:border-brand-600 hover:text-brand-800',
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-sand-500">{productsQuery.data?.total ?? 0} products</p>
        <SortSelect value={sort} onChange={setSort} />
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
  )
}
