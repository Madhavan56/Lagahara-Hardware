import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { useAdminProducts, useDeleteProduct } from '@/features/admin/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const { data: products, isLoading } = useAdminProducts(search)
  const deleteProduct = useDeleteProduct()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-sand-900">Products</h1>
        <Link to="/admin/products/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" />
          New product
        </Link>
      </div>

      <div className="mt-5 max-w-sm">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or SKU"
          leadingIcon={<Search className="size-4" />}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-sand-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-sand-500 uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sand-500">
                  Loading…
                </td>
              </tr>
            ) : (
              products?.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
                const imageUrl = productImageUrl(primaryImage?.storagePath)
                return (
                  <tr key={product.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/products/${product.id}`} className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                          {imageUrl ? <img src={imageUrl} alt="" className="size-full object-cover" /> : null}
                        </div>
                        <div>
                          <p className="font-medium text-sand-900">{product.name}</p>
                          <p className="text-xs text-sand-500">{product.sku}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sand-600">{product.categoryName}</td>
                    <td className="px-4 py-3 text-sand-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      {product.stockQuantity === 0 ? (
                        <Badge variant="danger" size="sm">Out of stock</Badge>
                      ) : product.stockQuantity <= product.lowStockThreshold ? (
                        <Badge variant="danger" size="sm">{product.stockQuantity} left</Badge>
                      ) : (
                        <span className="text-sand-600">{product.stockQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? 'success' : 'neutral'} size="sm">
                        {product.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                            deleteProduct.mutate(product.id)
                          }
                        }}
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
