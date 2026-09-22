import { supabase } from '@/lib/supabase/client'
import type { Category, CategoryAttribute, ProductListItem, ShippingMethod } from '@/types/catalog'

type Row = Record<string, unknown>

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function mapCategory(row: Row): Category {
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    name: asString(row.name),
    description: asNullableString(row.description),
    imageUrl: asNullableString(row.image_url),
    sortOrder: asNumber(row.sort_order),
  }
}

function mapCategoryAttribute(row: Row): CategoryAttribute {
  return {
    id: asString(row.id),
    categoryId: asString(row.category_id),
    key: asString(row.key),
    label: asString(row.label),
    dataType: asString(row.data_type) as CategoryAttribute['dataType'],
    unit: asNullableString(row.unit),
    options: Array.isArray(row.options) ? row.options.map(String) : [],
    isRequired: row.is_required === true,
    isFilterable: row.is_filterable === true,
    sortOrder: asNumber(row.sort_order),
  }
}

function mapProductListItem(row: Row): ProductListItem {
  const images = Array.isArray(row.product_images) ? (row.product_images as Row[]) : []
  const primary = images.find((image) => image.is_primary === true) ?? images[0]

  return {
    id: asString(row.id),
    slug: asString(row.slug),
    name: asString(row.name),
    brand: asNullableString(row.brand),
    price: asNumber(row.price),
    compareAtPrice: row.compare_at_price == null ? null : asNumber(row.compare_at_price),
    unitLabel: asString(row.unit_label) || 'piece',
    stockQuantity: asNumber(row.stock_quantity),
    ratingAvg: asNumber(row.rating_avg),
    ratingCount: asNumber(row.rating_count),
    categoryId: asString(row.category_id),
    primaryImagePath: primary ? asNullableString(primary.storage_path) : null,
  }
}

function mapShippingMethod(row: Row): ShippingMethod {
  return {
    id: asString(row.id),
    code: asString(row.code),
    name: asString(row.name),
    description: asNullableString(row.description),
    price: asNumber(row.price),
    etaDaysMin: asNumber(row.eta_days_min),
    etaDaysMax: asNumber(row.eta_days_max),
    sortOrder: asNumber(row.sort_order),
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, image_url, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return (data ?? []).map(mapCategory)
}

export async function fetchCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
  const { data, error } = await supabase
    .from('category_attributes')
    .select('id, category_id, key, label, data_type, unit, options, is_required, is_filterable, sort_order')
    .eq('category_id', categoryId)
    .order('sort_order')

  if (error) throw error
  return (data ?? []).map(mapCategoryAttribute)
}

const PRODUCT_LIST_SELECT =
  'id, slug, name, brand, price, compare_at_price, unit_label, stock_quantity, rating_avg, rating_count, category_id, product_images(storage_path, is_primary)'

export async function fetchFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapProductListItem)
}

export async function fetchNewArrivals(limit = 8): Promise<ProductListItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapProductListItem)
}

export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('id, code, name, description, price, eta_days_min, eta_days_max, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return (data ?? []).map(mapShippingMethod)
}
