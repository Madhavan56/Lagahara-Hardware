import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { buttonVariants } from '@/components/ui/button'
import { useProductsByIds } from '@/features/catalog/queries'
import { useWishlistStore } from '@/features/wishlist/store'

export default function WishlistPage() {
  const productIds = useWishlistStore((state) => state.productIds)
  const { data: products, isLoading, isError } = useProductsByIds(productIds)

  if (productIds.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <Heart className="size-12 text-sand-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-sand-900">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-sand-600">Save products you're considering for later.</p>
        <Link to="/shop" className={`mt-6 ${buttonVariants({ variant: 'primary' })}`}>
          Shop all products
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="mb-8 font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
        Your Wishlist
      </h1>
      <ProductGrid products={products} isLoading={isLoading} isError={isError} />
    </div>
  )
}
