export type AttributeDataType = 'text' | 'number' | 'boolean' | 'select'

export type AttributeValue = string | number | boolean

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

/** The schema definition for one attribute within a category. */
export type CategoryAttribute = {
  id: string
  categoryId: string
  key: string
  label: string
  dataType: AttributeDataType
  unit: string | null
  options: string[]
  isRequired: boolean
  isFilterable: boolean
  sortOrder: number
}

export type ProductImage = {
  id: string
  storagePath: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}

export type Product = {
  id: string
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
  /** Values keyed by CategoryAttribute.key for this product's category. */
  attributes: Record<string, AttributeValue>
  isActive: boolean
  isFeatured: boolean
  ratingAvg: number
  ratingCount: number
  createdAt: string
  images: ProductImage[]
}

export type ProductListItem = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'name'
  | 'brand'
  | 'price'
  | 'compareAtPrice'
  | 'unitLabel'
  | 'stockQuantity'
  | 'ratingAvg'
  | 'ratingCount'
  | 'categoryId'
> & {
  primaryImagePath: string | null
}

export type Review = {
  id: string
  productId: string
  userId: string
  rating: number
  title: string | null
  body: string | null
  createdAt: string
  authorName: string | null
}

export type RatingSummary = {
  average: number
  count: number
  /** Count of reviews at each star rating, 1..5 */
  histogram: Record<1 | 2 | 3 | 4 | 5, number>
}

export type ShippingMethod = {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  etaDaysMin: number
  etaDaysMax: number
  sortOrder: number
}
