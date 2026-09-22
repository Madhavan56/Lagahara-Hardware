import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProductSearch } from '@/features/catalog/queries'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { data, isLoading, isError } = useProductSearch(query)

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>
      <p className="mt-2 mb-8 text-sand-600">
        {query
          ? `${data?.length ?? 0} products found`
          : 'Enter a search term to find products.'}
      </p>

      {query ? (
        <ProductGrid products={data} isLoading={isLoading} isError={isError} />
      ) : null}
    </div>
  )
}
