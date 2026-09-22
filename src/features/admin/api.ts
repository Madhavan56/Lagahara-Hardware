import { supabase } from '@/lib/supabase/client'
import type { AttributeValue, CategoryAttribute } from '@/types/catalog'
import type { OrderStatus } from '@/types/order'

type Row = Record<string, unknown>

function asString(v: unknown) {
  return typeof v === 'string' ? v : ''
}
function asNullableString(v: unknown) {
  return typeof v === 'string' ? v : null
}
function asNumber(v: unknown) {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

// ---------------------------------------------------------------- products

export type AdminProduct = {
  id: string
  categoryId: string
  categoryName: string
  slug: string
  sku: string
  name: string
  brand: string | null
  description: string | null
  price: number
  compareAtPrice: number | null
  gstRate: number
  unitLabel: string
  stockQuantity: number
  lowStockThreshold: number
  attributes: Record<string, AttributeValue>
  isActive: boolean
  isFeatured: boolean
  images: { id: string; storagePath: string; isPrimary: boolean; sortOrder: number }[]
}

function mapAdminProduct(row: Row): AdminProduct {
  const category = row.categories as Row | null
  const images = Array.isArray(row.product_images) ? (row.product_images as Row[]) : []
  return {
    id: asString(row.id),
    categoryId: asString(row.category_id),
    categoryName: category ? asString(category.name) : '',
    slug: asString(row.slug),
    sku: asString(row.sku),
    name: asString(row.name),
    brand: asNullableString(row.brand),
    description: asNullableString(row.description),
    price: asNumber(row.price),
    compareAtPrice: row.compare_at_price == null ? null : asNumber(row.compare_at_price),
    gstRate: asNumber(row.gst_rate),
    unitLabel: asString(row.unit_label) || 'piece',
    stockQuantity: asNumber(row.stock_quantity),
    lowStockThreshold: asNumber(row.low_stock_threshold),
    attributes:
      row.attributes && typeof row.attributes === 'object' && !Array.isArray(row.attributes)
        ? (row.attributes as Record<string, AttributeValue>)
        : {},
    isActive: row.is_active === true,
    isFeatured: row.is_featured === true,
    images: images
      .map((img) => ({
        id: asString(img.id),
        storagePath: asString(img.storage_path),
        isPrimary: img.is_primary === true,
        sortOrder: asNumber(img.sort_order),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

const ADMIN_PRODUCT_SELECT =
  'id, category_id, slug, sku, name, brand, description, price, compare_at_price, gst_rate, unit_label, stock_quantity, low_stock_threshold, attributes, is_active, is_featured, categories(name), product_images(id, storage_path, is_primary, sort_order)'

export async function fetchAdminProducts(search?: string): Promise<AdminProduct[]> {
  let query = supabase.from('products').select(ADMIN_PRODUCT_SELECT).order('created_at', { ascending: false })
  if (search?.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`)
  }
  const { data, error } = await query.limit(200)
  if (error) throw error
  return (data ?? []).map(mapAdminProduct)
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase.from('products').select(ADMIN_PRODUCT_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapAdminProduct(data) : null
}

export type ProductWriteInput = {
  categoryId: string
  slug: string
  sku: string
  name: string
  brand: string | null
  description: string | null
  price: number
  compareAtPrice: number | null
  gstRate: number
  unitLabel: string
  stockQuantity: number
  lowStockThreshold: number
  attributes: Record<string, AttributeValue>
  isActive: boolean
  isFeatured: boolean
}

function toProductRow(input: ProductWriteInput) {
  return {
    category_id: input.categoryId,
    slug: input.slug,
    sku: input.sku,
    name: input.name,
    brand: input.brand,
    description: input.description,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    gst_rate: input.gstRate,
    unit_label: input.unitLabel,
    stock_quantity: input.stockQuantity,
    low_stock_threshold: input.lowStockThreshold,
    attributes: input.attributes,
    is_active: input.isActive,
    is_featured: input.isFeatured,
  }
}

export async function createProduct(input: ProductWriteInput): Promise<string> {
  const { data, error } = await supabase.from('products').insert(toProductRow(input)).select('id').single()
  if (error) throw error
  return data.id
}

export async function updateProduct(id: string, input: ProductWriteInput): Promise<void> {
  const { error } = await supabase.from('products').update(toProductRow(input)).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function updateStock(id: string, stockQuantity: number): Promise<void> {
  const { error } = await supabase.from('products').update({ stock_quantity: stockQuantity }).eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(
  productId: string,
  categorySlug: string,
  file: File,
  sortOrder: number,
  isPrimary: boolean,
): Promise<void> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${categorySlug}/admin-${productId}-${Date.now()}-${sortOrder}.${ext}`
  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: true,
  })
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('product_images').insert({
    product_id: productId,
    storage_path: path,
    sort_order: sortOrder,
    is_primary: isPrimary,
  })
  if (insertError) throw insertError
}

export async function deleteProductImage(imageId: string, storagePath: string): Promise<void> {
  await supabase.storage.from('product-images').remove([storagePath])
  const { error } = await supabase.from('product_images').delete().eq('id', imageId)
  if (error) throw error
}

export async function setPrimaryImage(productId: string, imageId: string): Promise<void> {
  await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId)
  if (error) throw error
}

// -------------------------------------------------------- categories/attrs

export async function createCategory(input: {
  slug: string
  name: string
  description: string | null
}): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ slug: input.slug, name: input.name, description: input.description })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateCategory(
  id: string,
  input: { name: string; description: string | null; isActive: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ name: input.name, description: input.description, is_active: input.isActive })
    .eq('id', id)
  if (error) throw error
}

export type CategoryAttributeInput = {
  key: string
  label: string
  dataType: CategoryAttribute['dataType']
  unit: string | null
  options: string[]
  isRequired: boolean
  isFilterable: boolean
  sortOrder: number
}

export async function createCategoryAttribute(categoryId: string, input: CategoryAttributeInput): Promise<void> {
  const { error } = await supabase.from('category_attributes').insert({
    category_id: categoryId,
    key: input.key,
    label: input.label,
    data_type: input.dataType,
    unit: input.unit,
    options: input.options,
    is_required: input.isRequired,
    is_filterable: input.isFilterable,
    sort_order: input.sortOrder,
  })
  if (error) throw error
}

export async function updateCategoryAttribute(id: string, input: CategoryAttributeInput): Promise<void> {
  const { error } = await supabase
    .from('category_attributes')
    .update({
      label: input.label,
      data_type: input.dataType,
      unit: input.unit,
      options: input.options,
      is_required: input.isRequired,
      is_filterable: input.isFilterable,
      sort_order: input.sortOrder,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCategoryAttribute(id: string): Promise<void> {
  const { error } = await supabase.from('category_attributes').delete().eq('id', id)
  if (error) throw error
}

// ------------------------------------------------------------------ orders

export type AdminOrderListItem = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  total: number
  createdAt: string
  customerEmail: string | null
  customerName: string | null
}

export async function fetchAdminOrders(statusFilter?: OrderStatus): Promise<AdminOrderListItem[]> {
  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, customer_email, customer_name')
    .order('created_at', { ascending: false })
    .limit(200)
  if (statusFilter) query = query.eq('status', statusFilter)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: asString(row.id),
    orderNumber: asString(row.order_number),
    status: asString(row.status) as OrderStatus,
    paymentStatus: asString(row.payment_status),
    total: asNumber(row.total),
    createdAt: asString(row.created_at),
    customerEmail: asNullableString(row.customer_email),
    customerName: asNullableString(row.customer_name),
  }))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) throw error
}

// --------------------------------------------------------- shipping/reviews

export async function updateShippingMethod(
  id: string,
  input: { name: string; description: string | null; price: number; etaDaysMin: number; etaDaysMax: number },
): Promise<void> {
  const { error } = await supabase
    .from('shipping_methods')
    .update({
      name: input.name,
      description: input.description,
      price: input.price,
      eta_days_min: input.etaDaysMin,
      eta_days_max: input.etaDaysMax,
    })
    .eq('id', id)
  if (error) throw error
}

export type AdminReview = {
  id: string
  productId: string
  productName: string
  reviewerName: string
  rating: number
  title: string | null
  body: string | null
  isApproved: boolean
  createdAt: string
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, reviewer_name, rating, title, body, is_approved, created_at, products(name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: asString(row.id),
    productId: asString(row.product_id),
    productName: row.products ? asString((row.products as Row).name) : '',
    reviewerName: asString(row.reviewer_name),
    rating: asNumber(row.rating),
    title: asNullableString(row.title),
    body: asNullableString(row.body),
    isApproved: row.is_approved === true,
    createdAt: asString(row.created_at),
  }))
}

export async function setReviewApproval(id: string, isApproved: boolean): Promise<void> {
  const { error } = await supabase.from('reviews').update({ is_approved: isApproved }).eq('id', id)
  if (error) throw error
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}
