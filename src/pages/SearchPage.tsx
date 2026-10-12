import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProductSearch } from '@/features/catalog/queries'
import { PageTitle } from '@/components/motion/page-title'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { data, isLoading, isError } = useProductSearch(query)

  return (
    <div className="container-page py-10 lg:py-14">
      <PageTitle className="text-h1 text-content" text={query ? `Results for "${query}"` : 'Search'} />
      <p className="mt-2 mb-8 text-ink-600">
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
