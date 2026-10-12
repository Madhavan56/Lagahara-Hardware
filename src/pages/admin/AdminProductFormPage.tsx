import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DynamicAttributeField } from '@/components/admin/DynamicAttributeField'
import { ProductImageManager } from '@/components/admin/ProductImageManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductWriteInput } from '@/features/admin/api'
import {
  useAdminProduct,
  useCreateProduct,
  useDeleteProduct,
  useSetProductActive,
  useUpdateProduct,
} from '@/features/admin/queries'
import { useCategories, useCategoryAttributes } from '@/features/catalog/queries'
import { showToast } from '@/features/toast/store'
import { MAX_WASTAGE_PERCENT, parseSheetSize } from '@/lib/sheetCalculator'
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
  isSheetProduct: false,
  sheetLengthFt: '',
  sheetWidthFt: '',
  wastagePercent: '10',
}

type FormState = typeof emptyForm

// Mirrors the products table constraints so most mistakes are caught before
// the round trip; the database still has the final say.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_SHEET_FT = 20

function parseNumber(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value)
}

function validate(form: FormState): { input: Omit<ProductWriteInput, 'attributes'> } | { error: string } {
  if (!form.categoryId) return { error: 'Select a category.' }
  const name = form.name.trim()
  if (name.length < 2 || name.length > 200) return { error: 'Name must be 2–200 characters.' }
  const slug = form.slug.trim() || slugify(name)
  if (!SLUG_PATTERN.test(slug)) return { error: 'Slug may only contain lowercase letters, numbers and single hyphens.' }
  const sku = form.sku.trim()
  if (!sku) return { error: 'SKU is required.' }

  const price = parseNumber(form.price)
  if (!Number.isFinite(price) || price < 0) return { error: 'Enter a valid price.' }
  const compareAtPrice = form.compareAtPrice.trim() ? parseNumber(form.compareAtPrice) : null
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
    return { error: 'Old price must be higher than the price (or left blank).' }
  }
  const gstRate = parseNumber(form.gstRate)
  if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) return { error: 'GST rate must be 0–100.' }

  const stockQuantity = parseNumber(form.stockQuantity)
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) return { error: 'Stock must be a whole number, 0 or more.' }
  const lowStockThreshold = parseNumber(form.lowStockThreshold)
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return { error: 'Low-stock threshold must be a whole number, 0 or more.' }
  }

  const wastagePercent = parseNumber(form.wastagePercent)
  if (!Number.isFinite(wastagePercent) || wastagePercent < 0 || wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage must be 0–${MAX_WASTAGE_PERCENT}%.` }
  }
  let sheetLengthFt: number | null = null
  let sheetWidthFt: number | null = null
  if (form.isSheetProduct) {
    sheetLengthFt = parseNumber(form.sheetLengthFt)
    sheetWidthFt = parseNumber(form.sheetWidthFt)
    const okDim = (v: number) => Number.isFinite(v) && v > 0 && v <= MAX_SHEET_FT
    if (!okDim(sheetLengthFt) || !okDim(sheetWidthFt)) {
      return { error: `Sheet length and width must be between 0 and ${MAX_SHEET_FT} ft.` }
    }
  }

  return {
    input: {
      categoryId: form.categoryId,
      slug,
      sku,
      name,
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      price,
      compareAtPrice,
      gstRate,
      unitLabel: form.unitLabel.trim() || 'piece',
      stockQuantity,
      lowStockThreshold,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isSheetProduct: form.isSheetProduct,
      sheetLengthFt,
      sheetWidthFt,
      wastagePercent,
    },
  }
}

const SECTION = 'rounded-card border border-border-subtle bg-card p-5'
const SECTION_TITLE = 'mb-4 text-sm font-semibold tracking-wide text-content uppercase'
const CHECKBOX = 'size-4 rounded border-border-strong text-iris-700'

export default function AdminProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const isEditing = Boolean(productId)
  const navigate = useNavigate()

  const { data: existing, isLoading: existingLoading } = useAdminProduct(productId)
  const { data: categories = [] } = useCategories()
  const [form, setForm] = useState(emptyForm)
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const { data: categoryAttributes = [] } = useCategoryAttributes(form.categoryId || undefined)

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(productId ?? '')
  const setActive = useSetProductActive()
  const deleteProduct = useDeleteProduct()

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
        isSheetProduct: existing.isSheetProduct,
        sheetLengthFt: existing.sheetLengthFt != null ? String(existing.sheetLengthFt) : '',
        sheetWidthFt: existing.sheetWidthFt != null ? String(existing.sheetWidthFt) : '',
        wastagePercent: String(existing.wastagePercent),
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

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSheetProduct(checked: boolean) {
    setForm((prev) => {
      const next = { ...prev, isSheetProduct: checked }
      // Pre-fill dimensions from the "Sheet size" spec when it's set, e.g. "8x4 ft".
      if (checked && !prev.sheetLengthFt && !prev.sheetWidthFt) {
        const raw = attributes.sheet_size
        const size = parseSheetSize(typeof raw === 'string' ? raw : null)
        if (size) {
          next.sheetLengthFt = String(size.lengthFt)
          next.sheetWidthFt = String(size.widthFt)
        }
      }
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    const result = validate(form)
    if ('error' in result) return setFormError(result.error)

    for (const attr of categoryAttributes) {
      const value = attributes[attr.key]
      if (attr.isRequired && (value === undefined || value === '' || value === null)) {
        return setFormError(`"${attr.label}" is required.`)
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

    const input: ProductWriteInput = { ...result.input, attributes: cleanedAttributes }

    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync(input)
        showToast({ title: 'Product saved' })
        navigate('/admin/products')
      } else {
        const newId = await createProduct.mutateAsync(input)
        showToast({ title: 'Product created. Add images below.' })
        navigate(`/admin/products/${newId}`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save product')
    }
  }

  function toggleVisibility() {
    if (!existing) return
    const hiding = existing.isActive
    if (hiding && !confirm('Hide this product from the storefront? It stays in orders and reports.')) return
    setActive.mutate(
      { id: existing.id, isActive: !hiding },
      {
        onSuccess: () => {
          updateField('isActive', !hiding)
          showToast({ title: hiding ? 'Product hidden' : 'Product visible again' })
        },
        onError: (err) => showToast({ tone: 'error', title: err.message }),
      },
    )
  }

  function hardDelete() {
    if (!existing) return
    if (!confirm(`Permanently delete "${existing.name}"? This cannot be undone.`)) return
    deleteProduct.mutate(existing.id, {
      onSuccess: () => {
        showToast({ title: 'Product deleted' })
        navigate('/admin/products')
      },
      onError: (err) => showToast({ tone: 'error', title: err.message }),
    })
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  return (
    <div className="max-w-3xl">
      <h1 className="text-h2 text-content">{isEditing ? 'Edit product' : 'New product'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Basics</h2>
          <div className="space-y-4">
            <div className="w-full">
              <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium text-ink-800">
                Category
              </label>
              <select
                id="product-category"
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                className="h-11 w-full rounded-md border border-border-strong bg-card px-3.5 text-sm focus:border-iris-600 focus:outline-none"
              >
                <option value="">Select a category…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Name" value={form.name} maxLength={200} onChange={(e) => updateField('name', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value.toLowerCase())}
                hint="Leave blank to generate from the name"
              />
              <Input label="SKU" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />
            </div>
            <Input label="Brand" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
            <div>
              <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium text-ink-800">
                Description
              </label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-sm focus:border-iris-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price (₹, GST-inclusive)" type="number" min={0} step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
            <Input
              label="Old price (optional)"
              type="number"
              min={0}
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => updateField('compareAtPrice', e.target.value)}
              hint="Shown struck through; must be higher than the price"
            />
            <Input label="GST rate (%)" type="number" min={0} max={100} value={form.gstRate} onChange={(e) => updateField('gstRate', e.target.value)} />
            <Input label="Unit label" value={form.unitLabel} onChange={(e) => updateField('unitLabel', e.target.value)} hint="e.g. sheet, piece, set, pair" />
            <Input label="Stock quantity" type="number" min={0} step={1} value={form.stockQuantity} onChange={(e) => updateField('stockQuantity', e.target.value)} />
            <Input label="Low stock threshold" type="number" min={0} step={1} value={form.lowStockThreshold} onChange={(e) => updateField('lowStockThreshold', e.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} className={CHECKBOX} />
              Active (visible on storefront)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} className={CHECKBOX} />
              Featured on homepage
            </label>
          </div>
        </div>

        {selectedCategory && categoryAttributes.length > 0 ? (
          <div className={SECTION}>
            <h2 className={SECTION_TITLE}>{selectedCategory.name} specifications</h2>
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

        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Square feet calculator</h2>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.isSheetProduct} onChange={(e) => toggleSheetProduct(e.target.checked)} className={CHECKBOX} />
            Sold by the sheet: show the sq ft calculator on the product page
          </label>
          {form.isSheetProduct ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input label="Sheet length (ft)" type="number" min={0} max={MAX_SHEET_FT} step="0.01" value={form.sheetLengthFt} onChange={(e) => updateField('sheetLengthFt', e.target.value)} />
              <Input label="Sheet width (ft)" type="number" min={0} max={MAX_SHEET_FT} step="0.01" value={form.sheetWidthFt} onChange={(e) => updateField('sheetWidthFt', e.target.value)} />
              <Input
                label="Default wastage (%)"
                type="number"
                min={0}
                max={MAX_WASTAGE_PERCENT}
                step="0.5"
                value={form.wastagePercent}
                onChange={(e) => updateField('wastagePercent', e.target.value)}
              />
            </div>
          ) : null}
          {form.isSheetProduct ? (
            <p className="mt-2 text-xs text-content-muted">The price above is treated as the price per sheet.</p>
          ) : null}
        </div>

        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Images</h2>
          {isEditing && existing ? (
            <ProductImageManager
              productId={existing.id}
              productName={existing.name}
              categorySlug={existing.categorySlug}
              images={existing.images}
            />
          ) : (
            <p className="text-sm text-content-muted">Create the product first, then add images here.</p>
          )}
        </div>

        {formError ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
            {isEditing ? 'Save changes' : 'Create product'}
          </Button>
          {isEditing && existing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={toggleVisibility}
                loading={setActive.isPending}
                leadingIcon={existing.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              >
                {existing.isActive ? 'Hide product' : 'Show product'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={hardDelete}
                loading={deleteProduct.isPending}
                leadingIcon={<Trash2 className="size-4" />}
                className="text-danger hover:bg-danger-surface hover:text-danger"
              >
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  )
}
