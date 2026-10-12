import { Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '@/components/product/Pagination'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AdminProduct } from '@/features/admin/api'
import { useAdminProducts, useDeleteProduct, useSetProductActive } from '@/features/admin/queries'
import { stockStatus } from '@/features/admin/stock'
import { useCategories } from '@/features/catalog/queries'
import { showToast } from '@/features/toast/store'
import { productImageUrl } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const PAGE_SIZE = 20

type StockFilter = 'all' | 'in' | 'low' | 'out'
type VisibilityFilter = 'all' | 'active' | 'hidden'

const SELECT_CLASS =
  'h-11 rounded-md border border-border-subtle bg-card px-3 text-sm text-content hover:border-border-strong focus:border-primary focus:outline-none'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [categoryId, setCategoryId] = useState('')
  const [stock, setStock] = useState<StockFilter>('all')
  const [visibility, setVisibility] = useState<VisibilityFilter>('all')
  const [page, setPage] = useState(1)

  const { data: products, isLoading } = useAdminProducts(deferredSearch)
  const { data: categories = [] } = useCategories()
  const deleteProduct = useDeleteProduct()
  const setActive = useSetProductActive()

  const filtered = useMemo(
    () =>
      (products ?? []).filter(
        (p) =>
          (!categoryId || p.categoryId === categoryId) &&
          (stock === 'all' || stockStatus(p) === stock) &&
          (visibility === 'all' || (visibility === 'active' ? p.isActive : !p.isActive)),
      ),
    [products, categoryId, stock, visibility],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Any filter change returns to page 1.
  function withReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  function toggleActive(product: AdminProduct) {
    const hiding = product.isActive
    if (hiding && !confirm(`Hide "${product.name}"? It will disappear from the storefront but stay in orders and reports.`)) {
      return
    }
    setActive.mutate(
      { id: product.id, isActive: !hiding },
      {
        onSuccess: () => showToast({ title: hiding ? 'Product hidden' : 'Product visible again' }),
        onError: (err) => showToast({ tone: 'error', title: err.message }),
      },
    )
  }

  function hardDelete(product: AdminProduct) {
    if (
      !confirm(
        `Permanently delete "${product.name}"?\n\nThis cannot be undone. Products that have been ordered can't be deleted, only hidden.`,
      )
    ) {
      return
    }
    deleteProduct.mutate(product.id, {
      onSuccess: () => showToast({ title: 'Product deleted' }),
      onError: (err) => showToast({ tone: 'error', title: err.message }),
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-content">Products</h1>
        <Link to="/admin/products/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" />
          New product
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <Input
          value={search}
          onChange={(event) => withReset(setSearch)(event.target.value)}
          placeholder="Search name, SKU or brand"
          aria-label="Search products"
          leadingIcon={<Search className="size-4" />}
        />
        <select
          aria-label="Filter by category"
          value={categoryId}
          onChange={(e) => withReset(setCategoryId)(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by stock"
          value={stock}
          onChange={(e) => withReset(setStock)(e.target.value as StockFilter)}
          className={SELECT_CLASS}
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          aria-label="Filter by visibility"
          value={visibility}
          onChange={(e) => withReset(setVisibility)(e.target.value as VisibilityFilter)}
          className={SELECT_CLASS}
        >
          <option value="all">Active & hidden</option>
          <option value="active">Active only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-content-muted">
        {isLoading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
      </p>

      <div className="mt-2 overflow-x-auto rounded-card border border-border-subtle bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border-subtle bg-surface text-left text-xs text-content-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-content-muted">
                  Loading…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-content-muted">
                  No products match these filters.
                </td>
              </tr>
            ) : (
              pageItems.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
                const imageUrl = productImageUrl(primaryImage?.storagePath, { width: 100 })
                const status = stockStatus(product)
                return (
                  <tr key={product.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/products/${product.id}`} className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-sm bg-surface-sunken">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <ProductImagePlaceholder size="sm" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-content hover:text-primary">{product.name}</p>
                          <p className="text-xs text-content-muted">{product.sku}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{product.categoryName}</td>
                    <td className="px-4 py-3 text-content">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      {status === 'out' ? (
                        <Badge variant="danger" size="sm">Out of stock</Badge>
                      ) : status === 'low' ? (
                        <Badge variant="warning" size="sm">{product.stockQuantity} left</Badge>
                      ) : (
                        <span className="text-ink-600">{product.stockQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? 'success' : 'neutral'} size="sm">
                        {product.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(product)}
                          className="rounded-pill p-2 text-ink-600 hover:bg-surface-sunken hover:text-content"
                          aria-label={product.isActive ? `Hide ${product.name}` : `Show ${product.name}`}
                          title={product.isActive ? 'Hide from storefront' : 'Show on storefront'}
                        >
                          {product.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => hardDelete(product)}
                          className="rounded-pill p-2 text-ink-600 hover:bg-danger-surface hover:text-danger"
                          aria-label={`Delete ${product.name}`}
                          title="Delete permanently"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="mt-6">
          <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  )
}
