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

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, image_url, sort_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data ? mapCategory(data) : null
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

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating'

export type ProductAttributeFilters = {
  /** Select-type attributes: key -> allowed values (OR'd together). */
  select: Record<string, string[]>
  /** Boolean-type attributes: key -> required value. */
  boolean: Record<string, boolean>
}

export type ProductsPageParams = {
  categoryId?: string
  searchQuery?: string
  filters?: ProductAttributeFilters
  sort?: ProductSort
  page?: number
  pageSize?: number
}

export type ProductsPage = {
  items: ProductListItem[]
  total: number
}

export async function fetchProductsPage({
  categoryId,
  searchQuery,
  filters,
  sort = 'newest',
  page = 1,
  pageSize = 12,
}: ProductsPageParams): Promise<ProductsPage> {
  let query = supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT, { count: 'exact' })
    .eq('is_active', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (searchQuery?.trim()) {
    query = query.textSearch('search_vector', searchQuery.trim(), {
      type: 'websearch',
      config: 'english',
    })
  }

  for (const [key, values] of Object.entries(filters?.select ?? {})) {
    if (!values.length) continue
    if (values.length === 1) {
      query = query.eq(`attributes->>${key}`, values[0] as string)
    } else {
      query = query.or(values.map((value) => `attributes->>${key}.eq.${value}`).join(','))
    }
  }

  for (const [key, value] of Object.entries(filters?.boolean ?? {})) {
    query = query.eq(`attributes->>${key}`, value ? 'true' : 'false')
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_avg', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const { data, error, count } = await query.range(from, from + pageSize - 1)

  if (error) throw error
  return { items: (data ?? []).map(mapProductListItem), total: count ?? 0 }
}

/**
 * Ranked full-text + trigram word-similarity search via the search_products
 * RPC, so typos ("plywod", "hetich") still resolve. The RPC returns ids only
 * (Postgres functions can't return embedded relations), so full rows —
 * including joined images — are re-fetched and re-ordered by rank.
 */
export async function searchProducts(query: string, limit = 24): Promise<ProductListItem[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const { data: ranked, error: rankError } = await supabase.rpc('search_products', {
    search_query: trimmed,
    result_limit: limit,
  })

  if (rankError) throw rankError
  const ids = (ranked ?? []).map((row) => row.id)
  if (!ids.length) return []

  const { data, error } = await supabase.from('products').select(PRODUCT_LIST_SELECT).in('id', ids)
  if (error) throw error

  const byId = new Map((data ?? []).map((row) => [row.id, row]))
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map(mapProductListItem)
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
