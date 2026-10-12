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

/// ---------------------------------------------------------------- products

export type AdminProductImage = {
  id: string
  storagePath: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export type AdminProduct = {
  id: string
  categoryId: string
  categoryName: string
  categorySlug: string
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
  isSheetProduct: boolean
  sheetLengthFt: number | null
  sheetWidthFt: number | null
  wastagePercent: number
  images: AdminProductImage[]
}

function asNullableNumber(v: unknown) {
  return v == null ? null : asNumber(v)
}

function mapAdminProduct(row: Row): AdminProduct {
  const category = row.categories as Row | null
  const images = Array.isArray(row.product_images) ? (row.product_images as Row[]) : []
  return {
    id: asString(row.id),
    categoryId: asString(row.category_id),
    categoryName: category ? asString(category.name) : '',
    categorySlug: category ? asString(category.slug) : '',
    slug: asString(row.slug),
    sku: asString(row.sku),
    name: asString(row.name),
    brand: asNullableString(row.brand),
    description: asNullableString(row.description),
    price: asNumber(row.price),
    compareAtPrice: asNullableNumber(row.compare_at_price),
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
    isSheetProduct: row.is_sheet_product === true,
    sheetLengthFt: asNullableNumber(row.sheet_length_ft),
    sheetWidthFt: asNullableNumber(row.sheet_width_ft),
    wastagePercent: row.wastage_percent == null ? 10 : asNumber(row.wastage_percent),
    images: images
      .map((img) => ({
        id: asString(img.id),
        storagePath: asString(img.storage_path),
        altText: asNullableString(img.alt_text),
        isPrimary: img.is_primary === true,
        sortOrder: asNumber(img.sort_order),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

const ADMIN_PRODUCT_SELECT =
  'id, category_id, slug, sku, name, brand, description, price, compare_at_price, gst_rate, unit_label, stock_quantity, low_stock_threshold, attributes, is_active, is_featured, is_sheet_product, sheet_length_ft, sheet_width_ft, wastage_percent, categories(name, slug), product_images(id, storage_path, alt_text, is_primary, sort_order)'

/** Strips characters that have meaning inside a PostgREST `or=(...)` filter. */
function sanitizeSearch(term: string) {
  return term.replace(/[,()*%\\:"]/g, ' ').trim()
}

// The catalog is a few hundred SKUs at most, so the admin list loads it whole
// and filters/paginates client-side (stock status needs stock <= threshold,
// a column comparison PostgREST can't express).
export async function fetchAdminProducts(search?: string): Promise<AdminProduct[]> {
  let query = supabase.from('products').select(ADMIN_PRODUCT_SELECT).order('created_at', { ascending: false })
  const term = search ? sanitizeSearch(search) : ''
  if (term) {
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,brand.ilike.%${term}%`)
  }
  const { data, error } = await query.limit(1000)
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
  isSheetProduct: boolean
  sheetLengthFt: number | null
  sheetWidthFt: number | null
  wastagePercent: number
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
    is_sheet_product: input.isSheetProduct,
    sheet_length_ft: input.sheetLengthFt,
    sheet_width_ft: input.sheetWidthFt,
    wastage_percent: input.wastagePercent,
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

/** Soft delete: hides the product from the storefront, keeps it for orders/reports. */
export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

/** Hard delete. The database refuses (restrict_violation) if any order references the product. */
export async function deleteProduct(id: string): Promise<void> {
  const { data: images } = await supabase.from('product_images').select('storage_path').eq('product_id', id)
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    if (error.code === '23001') {
      throw new Error('This product has orders, so it can only be hidden, not deleted.')
    }
    throw error
  }
  await removeUnreferencedObjects((images ?? []).map((img) => img.storage_path))
}

export async function updateStock(id: string, stockQuantity: number): Promise<void> {
  const { error } = await supabase.from('products').update({ stock_quantity: stockQuantity }).eq('id', id)
  if (error) throw error
}

export async function updateLowStockThreshold(id: string, threshold: number): Promise<void> {
  const { error } = await supabase.from('products').update({ low_stock_threshold: threshold }).eq('id', id)
  if (error) throw error
}

// ------------------------------------------------------------------ images

const IMAGE_BUCKET = 'product-images'

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function newObjectPath(prefix: string, file: Blob) {
  const ext = EXTENSION_BY_TYPE[file.type]
  if (!ext) throw new Error('Only JPG, PNG and WebP images are allowed.')
  return `${prefix}/${crypto.randomUUID()}.${ext}`
}

/**
 * Some storage objects are shared (one representative photo is used by every
 * product in a category), so an object is removed only once no product image
 * or category row points at it any more.
 */
async function removeUnreferencedObjects(paths: string[]) {
  for (const path of new Set(paths)) {
    const [{ count: imageRefs }, { count: categoryRefs }] = await Promise.all([
      supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('storage_path', path),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('image_path', path),
    ])
    if ((imageRefs ?? 0) === 0 && (categoryRefs ?? 0) === 0) {
      const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path])
      if (error) throw error
    }
  }
}

export async function uploadProductImage(input: {
  productId: string
  categorySlug: string
  file: Blob
  sortOrder: number
  isPrimary: boolean
  altText: string | null
}): Promise<void> {
  const path = newObjectPath(`${input.categorySlug || 'uncategorised'}/${input.productId}`, input.file)
  const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('product_images').insert({
    product_id: input.productId,
    storage_path: path,
    sort_order: input.sortOrder,
    is_primary: input.isPrimary,
    alt_text: input.altText,
  })
  if (insertError) {
    // Don't leave an orphaned file behind if the row couldn't be written.
    await supabase.storage.from(IMAGE_BUCKET).remove([path])
    throw insertError
  }
}

export async function deleteProductImage(image: { id: string; storagePath: string }): Promise<void> {
  const { data: deleted, error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', image.id)
    .select('product_id, is_primary')
    .maybeSingle()
  if (error) throw error

  // Keep a primary image whenever the product still has any images.
  if (deleted?.is_primary) {
    const { data: next } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', deleted.product_id)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    if (next) await setPrimaryImage(next.id)
  }

  await removeUnreferencedObjects([image.storagePath])
}

export async function setPrimaryImage(imageId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_primary_image', { p_image_id: imageId })
  if (error) throw error
}

export async function reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
  const { error } = await supabase.rpc('admin_reorder_product_images', {
    p_product_id: productId,
    p_image_ids: imageIds,
  })
  if (error) throw error
}

export async function updateImageAlt(imageId: string, altText: string | null): Promise<void> {
  const { error } = await supabase.from('product_images').update({ alt_text: altText }).eq('id', imageId)
  if (error) throw error
}

export async function uploadCategoryImage(input: {
  categoryId: string
  slug: string
  file: Blob
  altText: string | null
  previousPath: string | null
}): Promise<void> {
  const path = newObjectPath(`categories/${input.slug}`, input.file)
  const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { error } = await supabase
    .from('categories')
    .update({ image_path: path, image_alt: input.altText })
    .eq('id', input.categoryId)
  if (error) {
    await supabase.storage.from(IMAGE_BUCKET).remove([path])
    throw error
  }
  if (input.previousPath) await removeUnreferencedObjects([input.previousPath])
}

export async function removeCategoryImage(categoryId: string, path: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ image_path: null, image_alt: null }).eq('id', categoryId)
  if (error) throw error
  await removeUnreferencedObjects([path])
}

export async function updateCategoryImageAlt(categoryId: string, altText: string | null): Promise<void> {
  const { error } = await supabase.from('categories').update({ image_alt: altText }).eq('id', categoryId)
  if (error) throw error
}

// ------------------------------------------------------------------ admins

export type AdminAccount = { id: string; email: string; fullName: string | null; createdAt: string }

export async function fetchAdmins(): Promise<AdminAccount[]> {
  const { data, error } = await supabase.rpc('admin_list_admins')
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    createdAt: row.created_at,
  }))
}

export async function setUserRole(email: string, role: 'admin' | 'customer'): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_role', { p_email: email, p_role: role })
  if (error) throw new Error(error.message)
}

/// --------------------------------------------------------------- dashboard

export type DashboardDay = { date: string; revenue: number; orders: number }

export type DashboardRecentOrder = {
  id: string
  orderNumber: string
  customerName: string | null
  total: number
  status: OrderStatus
  createdAt: string
}

export type DashboardData = {
  ordersToday: number
  ordersYesterday: number
  revenueToday: number
  revenueYesterday: number
  toFulfil: number
  awaitingPayment: number
  /** Oldest first, one entry per local calendar day, today last. */
  days: DashboardDay[]
  statusCounts: Record<OrderStatus, number>
  recentOrders: DashboardRecentOrder[]
}

export const DASHBOARD_DAYS = 14

/** Orders that count as sales: placed and not cancelled (unpaid checkouts stay 'pending'). */
function isPlaced(status: string) {
  return status !== 'pending' && status !== 'cancelled'
}

function localDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** "Today" is the admin's local calendar day. Revenue is GST-inclusive order totals. */
export async function fetchDashboard(): Promise<DashboardData> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (DASHBOARD_DAYS - 1))

  const [windowed, allStatuses, recent] = await Promise.all([
    supabase.from('orders').select('total, status, created_at').gte('created_at', start.toISOString()),
    supabase.from('orders').select('status').limit(5000),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])
  if (windowed.error) throw windowed.error
  if (allStatuses.error) throw allStatuses.error
  if (recent.error) throw recent.error

  const days: DashboardDay[] = []
  const index = new Map<string, DashboardDay>()
  for (let i = 0; i < DASHBOARD_DAYS; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const day = { date: localDayKey(d), revenue: 0, orders: 0 }
    days.push(day)
    index.set(day.date, day)
  }
  for (const order of windowed.data ?? []) {
    if (!isPlaced(order.status)) continue
    const day = index.get(localDayKey(new Date(order.created_at)))
    if (!day) continue
    day.orders += 1
    day.revenue += asNumber(order.total)
  }

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  }
  for (const row of allStatuses.data ?? []) statusCounts[row.status as OrderStatus] += 1

  const today = days[days.length - 1]!
  const yesterday = days[days.length - 2]!
  return {
    ordersToday: today.orders,
    ordersYesterday: yesterday.orders,
    revenueToday: today.revenue,
    revenueYesterday: yesterday.revenue,
    toFulfil: statusCounts.confirmed + statusCounts.processing,
    awaitingPayment: statusCounts.pending,
    days,
    statusCounts,
    recentOrders: (recent.data ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      total: asNumber(row.total),
      status: row.status as OrderStatus,
      createdAt: row.created_at,
    })),
  }
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

// -------------------------------------------------------------- messages

export type AdminContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export async function fetchContactMessages(): Promise<AdminContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, phone, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: asString(row.id),
    name: asString(row.name),
    email: asString(row.email),
    phone: asNullableString(row.phone),
    message: asString(row.message),
    isRead: row.is_read === true,
    createdAt: asString(row.created_at),
  }))
}

export async function setMessageRead(id: string, isRead: boolean): Promise<void> {
  const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id)
  if (error) throw error
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw error
}
