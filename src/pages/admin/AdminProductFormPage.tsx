import { ImagePlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DynamicAttributeField } from '@/components/admin/DynamicAttributeField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminProduct,
  useCreateProduct,
  useDeleteProductImage,
  useSetPrimaryImage,
  useUpdateProduct,
  useUploadProductImage,
} from '@/features/admin/queries'
import { useCategories, useCategoryAttributes } from '@/features/catalog/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { AttributeValue } from '@/types/catalog'

const emptyForm = {
  categoryId: '',
  name: '',
  slug: '',
  sku: '',
  brand: '',
  description: '',
  price: '',
  compareAtPrice: '',
  gstRate: '18',
  unitLabel: 'piece',
  stockQuantity: '0',
  lowStockThreshold: '5',
  isActive: true,
  isFeatured: false,
}

export default function AdminProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const isEditing = Boolean(productId)
  const navigate = useNavigate()

  const { data: existing, isLoading: existingLoading } = useAdminProduct(productId)
  const { data: categories = [] } = useCategories()
  const [form, setForm] = useState(emptyForm)
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categoryAttributes = [] } = useCategoryAttributes(form.categoryId || undefined)

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(productId ?? '')
  const uploadImage = useUploadProductImage(productId ?? '')
  const deleteImage = useDeleteProductImage(productId ?? '')
  const setPrimaryImage = useSetPrimaryImage(productId ?? '')

  useEffect(() => {
    if (existing) {
      setForm({
        categoryId: existing.categoryId,
        name: existing.name,
        slug: existing.slug,
        sku: existing.sku,
        brand: existing.brand ?? '',
        description: existing.description ?? '',
        price: String(existing.price),
        compareAtPrice: existing.compareAtPrice != null ? String(existing.compareAtPrice) : '',
        gstRate: String(existing.gstRate),
        unitLabel: existing.unitLabel,
        stockQuantity: String(existing.stockQuantity),
        lowStockThreshold: String(existing.lowStockThreshold),
        isActive: existing.isActive,
        isFeatured: existing.isFeatured,
      })
      setAttributes(existing.attributes)
    }
  }, [existing])

  if (isEditing && existingLoading) {
    return <Skeleton className="h-96 rounded-card" />
  }
  if (isEditing && !existingLoading && !existing) {
    return <Navigate to="/admin/products" replace />
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!form.categoryId) return setFormError('Select a category')
    if (!form.name.trim()) return setFormError('Name is required')
    if (!form.sku.trim()) return setFormError('SKU is required')
    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) return setFormError('Enter a valid price')

    for (const attr of categoryAttributes) {
      const value = attributes[attr.key]
      if (attr.isRequired && (value === undefined || value === '' || value === null)) {
        return setFormError(`"${attr.label}" is required`)
      }
    }

    // Strip unset/empty attribute values rather than send invalid types —
    // the DB trigger rejects non-string values for text/select and
    // non-number for number, so "" must not be sent at all.
    const cleanedAttributes: Record<string, AttributeValue> = {}
    for (const attr of categoryAttributes) {
      const value = attributes[attr.key]
      if (value === undefined || value === '') continue
      cleanedAttributes[attr.key] = value
    }

    const input = {
      categoryId: form.categoryId,
      slug: form.slug.trim() || slugify(form.name),
      sku: form.sku.trim(),
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      price,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      gstRate: Number(form.gstRate) || 18,
      unitLabel: form.unitLabel.trim() || 'piece',
      stockQuantity: Math.max(0, Math.round(Number(form.stockQuantity) || 0)),
      lowStockThreshold: Math.max(0, Math.round(Number(form.lowStockThreshold) || 0)),
      attributes: cleanedAttributes,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    }

    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync(input)
        navigate('/admin/products')
      } else {
        const newId = await createProduct.mutateAsync(input)
        navigate(`/admin/products/${newId}`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save product')
    }
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-sand-900">
        {isEditing ? 'Edit product' : 'New product'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-card border border-sand-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Basics</h2>
          <div className="space-y-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-sand-800">Category</label>
              <select
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                className="h-11 w-full rounded-xl border border-sand-300 bg-white px-3.5 text-sm focus:border-brand-600 focus:outline-none"
              >
                <option value="">Select a category…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} hint="Leave blank to auto-generate" />
              <Input label="SKU" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />
            </div>
            <Input label="Brand" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-sand-800">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-card border border-sand-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price (₹, GST-inclusive)" type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
            <Input label="Compare-at price (optional)" type="number" value={form.compareAtPrice} onChange={(e) => updateField('compareAtPrice', e.target.value)} />
            <Input label="GST rate (%)" type="number" value={form.gstRate} onChange={(e) => updateField('gstRate', e.target.value)} />
            <Input label="Unit label" value={form.unitLabel} onChange={(e) => updateField('unitLabel', e.target.value)} hint="e.g. sheet, piece, set, pair" />
            <Input label="Stock quantity" type="number" value={form.stockQuantity} onChange={(e) => updateField('stockQuantity', e.target.value)} />
            <Input label="Low stock threshold" type="number" value={form.lowStockThreshold} onChange={(e) => updateField('lowStockThreshold', e.target.value)} />
          </div>
          <div className="mt-4 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-sand-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} className="size-4 rounded border-sand-300 text-brand-700" />
              Active (visible on storefront)
            </label>
            <label className="flex items-center gap-2 text-sm text-sand-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} className="size-4 rounded border-sand-300 text-brand-700" />
              Featured on homepage
            </label>
          </div>
        </div>

        {selectedCategory && categoryAttributes.length > 0 ? (
          <div className="rounded-card border border-sand-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">
              {selectedCategory.name} specifications
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryAttributes.map((attr) => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={attributes[attr.key]}
                  onChange={(value) => setAttributes((prev) => ({ ...prev, [attr.key]: value }))}
                />
              ))}
            </div>
          </div>
        ) : null}

        {isEditing && existing ? (
          <div className="rounded-card border border-sand-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Images</h2>
            <div className="flex flex-wrap gap-3">
              {existing.images.map((image) => {
                const url = productImageUrl(image.storagePath)
                return (
                  <div key={image.id} className="relative size-24 overflow-hidden rounded-lg border border-sand-200">
                    {url ? <img src={url} alt="" className="size-full object-cover" /> : null}
                    {image.isPrimary ? (
                      <span className="absolute top-1 left-1 rounded-full bg-brass-500 p-1">
                        <Star className="size-3 fill-sand-950 text-sand-950" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage.mutate(image.id)}
                        className="absolute top-1 left-1 rounded-full bg-white/90 p-1 text-sand-500 hover:text-brass-600"
                        title="Set as primary"
                      >
                        <Star className="size-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage.mutate({ imageId: image.id, storagePath: image.storagePath })}
                      className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-sand-500 hover:text-danger"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-sand-300 text-sand-400 hover:border-brand-400 hover:text-brand-600"
              >
                <ImagePlus className="size-5" />
                <span className="text-xs">Add</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file || !existing) return
                  const categorySlug = categories.find((c) => c.id === existing.categoryId)?.slug ?? 'misc'
                  uploadImage.mutate({
                    categorySlug,
                    file,
                    sortOrder: existing.images.length,
                    isPrimary: existing.images.length === 0,
                  })
                  event.target.value = ''
                }}
              />
            </div>
          </div>
        ) : null}

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
          {isEditing ? 'Save changes' : 'Create product'}
        </Button>
      </form>
    </div>
  )
}
