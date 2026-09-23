/**
 * Seeds ~8 realistic placeholder products per category (Phase 2).
 * Run with: npm run seed:catalog
 *
 * Idempotent: re-running upserts products by SKU and replaces their images.
 */
import { supabaseAdmin } from './lib/admin-client'

type AttributeValue = string | number | boolean

type CategoryAttrDef = {
  key: string
  label: string
  dataType: 'text' | 'number' | 'boolean' | 'select'
  unit: string | null
  options: string[]
  isRequired: boolean
}

type CategoryRow = {
  id: string
  slug: string
  name: string
}

type CategoryConfig = {
  brands: string[]
  unitLabel: string
  priceRange: [number, number]
  skuPrefix: string
  count: number
  featuredCount: number
  nameBuilder: (ctx: {
    brand: string
    attrs: Record<string, AttributeValue>
    index: number
    categoryName: string
  }) => string
  descriptionBuilder: (ctx: {
    brand: string
    attrs: Record<string, AttributeValue>
    categoryName: string
  }) => string
}

const TEXT_POOLS: Record<string, string[]> = {
  'mica-laminates.color': [
    'Ivory White',
    'Cappuccino Brown',
    'Charcoal Grey',
    'Oak Beige',
    'Slate Black',
    'Walnut Brown',
    'Pearl White',
    'Graphite',
  ],
  'mica-laminates.texture': ['Smooth', 'Linen', 'Wood Grain', 'Stone Grain', 'Leather', 'Brushed'],
  'aluminium-profiles.color': ['Silver', 'Champagne', 'Matte Black', 'Wood Finish', 'Bronze'],
  size: ['Standard', '450mm', '600mm', '900mm', '1200mm'],
}

const NUMBER_RANGES: Record<string, [number, number, number]> = {
  // [min, max, decimals]
  'plywood.thickness': [4, 25, 0],
  'mica-laminates.thickness': [0.8, 1.5, 1],
  'kitchen-hardware.load_capacity': [15, 45, 0],
  'wardrobe-hardware.load_capacity': [10, 35, 0],
  'hinges.opening_angle': [95, 165, 0],
  'hinges.load_capacity': [15, 40, 0],
  'drawer-systems.height': [65, 185, 0],
  'drawer-systems.depth': [270, 550, 0],
  'drawer-systems.load_capacity': [20, 60, 0],
  'drawer-channels.length': [250, 600, 0],
  'drawer-channels.load_capacity': [15, 45, 0],
  'handles-knobs.length': [64, 896, 0],
  'handles-knobs.center_distance': [32, 800, 0],
  'sliding-systems.load_capacity': [40, 120, 0],
  'sliding-systems.panel_thickness': [18, 40, 0],
  'sliding-systems.track_length': [1800, 3000, 0],
  'aluminium-profiles.length': [3000, 6500, 0],
  'aluminium-profiles.thickness': [1, 3, 1],
  'interior-hardware.load_capacity': [5, 30, 0],
  'furniture-accessories.load_capacity': [20, 80, 0],
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  plywood: {
    brands: ['Century', 'Greenply', 'Kitply', 'Archidply', 'Duro'],
    unitLabel: 'sheet',
    priceRange: [1800, 4800],
    skuPrefix: 'PLY',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) =>
      `${brand} ${attrs.grade} Plywood ${attrs.thickness}mm ${attrs.sheet_size}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${attrs.grade}-grade plywood, ${attrs.thickness}mm thick, ${attrs.sheet_size} sheet. Suited for ${String(attrs.application ?? 'interior').toLowerCase()} applications.`,
  },
  'mica-laminates': {
    brands: ['Merino', 'Greenlam', 'CenturyLam', 'Virgo', 'Sunmica'],
    unitLabel: 'sheet',
    priceRange: [900, 2800],
    skuPrefix: 'MICA',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.color} ${attrs.finish} Laminate`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} decorative laminate in ${attrs.color}, ${attrs.finish} finish with a ${attrs.texture} texture. ${attrs.thickness}mm, ${attrs.sheet_size} sheet.`,
  },
  'kitchen-hardware': {
    brands: ['Hettich', 'Ebco', 'Hafele', 'Sleek'],
    unitLabel: 'piece',
    priceRange: [600, 4500],
    skuPrefix: 'KIT',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.product_type} — ${attrs.material}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.product_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish. Load capacity ${attrs.load_capacity}kg.`,
  },
  'wardrobe-hardware': {
    brands: ['Hettich', 'Ebco', 'Hafele', 'Ozone'],
    unitLabel: 'piece',
    priceRange: [300, 3000],
    skuPrefix: 'WRD',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.product_type} — ${attrs.material}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.product_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish.`,
  },
  hinges: {
    brands: ['Hettich', 'Ebco', 'Hafele', 'Dorset', 'Godrej'],
    unitLabel: 'piece',
    priceRange: [40, 350],
    skuPrefix: 'HNG',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) =>
      `${brand} ${attrs.mounting_type} Hinge ${attrs.soft_close ? '(Soft Close)' : ''}`.trim(),
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${attrs.material} hinge, ${attrs.mounting_type} mount, ${attrs.opening_angle}° opening. ${attrs.soft_close ? 'Soft-close mechanism.' : ''}`,
  },
  'drawer-systems': {
    brands: ['Hettich', 'Ebco', 'Hafele', 'Sleek'],
    unitLabel: 'set',
    priceRange: [1200, 6500],
    skuPrefix: 'DRS',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.system_type} — ${attrs.depth}mm`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.system_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish. ${attrs.height}mm high, ${attrs.depth}mm deep.`,
  },
  'drawer-channels': {
    brands: ['Hettich', 'Ebco', 'Hafele', 'Dorset'],
    unitLabel: 'pair',
    priceRange: [250, 1800],
    skuPrefix: 'DRC',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.extension_type} Runner ${attrs.length}mm`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${attrs.mounting_type} drawer runner, ${attrs.extension_type}, ${attrs.length}mm.`,
  },
  'handles-knobs': {
    brands: ['Dorset', 'Hafele', 'Ebco', 'Godrej', 'Yale'],
    unitLabel: 'piece',
    priceRange: [60, 950],
    skuPrefix: 'HDL',
    count: 8,
    featuredCount: 2,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.product_type} — ${attrs.finish}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.product_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish.`,
  },
  'sliding-systems': {
    brands: ['Hettich', 'Hafele', 'Ebco', 'Dorma'],
    unitLabel: 'set',
    priceRange: [2500, 12000],
    skuPrefix: 'SLD',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.system_type} System`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.system_type).toLowerCase()} sliding system in ${attrs.material}. Load capacity ${attrs.load_capacity}kg.`,
  },
  'locks-security': {
    brands: ['Godrej', 'Yale', 'Dorset', 'Link'],
    unitLabel: 'piece',
    priceRange: [350, 4500],
    skuPrefix: 'LCK',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.lock_type}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.lock_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish. ${attrs.key_type} key.`,
  },
  'aluminium-profiles': {
    brands: ['Jindal', 'Hindalco', 'Extrusil', 'Ozone'],
    unitLabel: 'length',
    priceRange: [350, 1800],
    skuPrefix: 'ALU',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.profile_type} — ${attrs.finish}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.profile_type).toLowerCase()} profile, ${attrs.finish} finish, ${attrs.length}mm length.`,
  },
  'interior-hardware': {
    brands: ['Ebco', 'Hafele', 'Hettich', 'Dorset'],
    unitLabel: 'piece',
    priceRange: [50, 800],
    skuPrefix: 'INT',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.material} Fitting`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} general-purpose fitting in ${attrs.material}, ${attrs.finish} finish.`,
  },
  'furniture-accessories': {
    brands: ['Ebco', 'Hafele', 'Ozone', 'Dorset'],
    unitLabel: 'piece',
    priceRange: [40, 600],
    skuPrefix: 'ACC',
    count: 8,
    featuredCount: 1,
    nameBuilder: ({ brand, attrs }) => `${brand} ${attrs.product_type} — ${attrs.material}`,
    descriptionBuilder: ({ brand, attrs }) =>
      `${brand} ${String(attrs.product_type).toLowerCase()} in ${attrs.material}, ${attrs.finish} finish.`,
  },
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateAttributeValue(
  categorySlug: string,
  attr: CategoryAttrDef,
  index: number,
  brand: string,
  rand: () => number,
): AttributeValue {
  if (attr.key === 'brand') return brand

  if (attr.dataType === 'select') {
    return attr.options[index % attr.options.length] ?? attr.options[0] ?? ''
  }

  if (attr.dataType === 'boolean') {
    return index % 2 === 0
  }

  if (attr.dataType === 'number') {
    const [min, max, decimals] = NUMBER_RANGES[`${categorySlug}.${attr.key}`] ?? [1, 100, 0]
    const value = min + rand() * (max - min)
    return Number(value.toFixed(decimals))
  }

  // text
  const pool = TEXT_POOLS[`${categorySlug}.${attr.key}`] ?? TEXT_POOLS[attr.key]
  if (pool) return pool[index % pool.length] ?? pool[0] ?? ''
  if (attr.key === 'design_code') return `${categorySlug.slice(0, 3).toUpperCase()}-${1000 + index}`
  return `Standard`
}

async function main() {
  console.log('Fetching categories and attribute schemas…')
  const { data: categories, error: categoriesError } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')

  if (categoriesError) throw categoriesError
  if (!categories?.length) throw new Error('No categories found — apply migrations first.')

  const { data: attrRows, error: attrError } = await supabaseAdmin
    .from('category_attributes')
    .select('category_id, key, label, data_type, unit, options, is_required')
    .order('sort_order')

  if (attrError) throw attrError

  const attrsByCategory = new Map<string, CategoryAttrDef[]>()
  for (const row of attrRows ?? []) {
    const list = attrsByCategory.get(row.category_id) ?? []
    list.push({
      key: row.key,
      label: row.label,
      dataType: row.data_type,
      unit: row.unit,
      options: Array.isArray(row.options) ? row.options.map(String) : [],
      isRequired: row.is_required,
    })
    attrsByCategory.set(row.category_id, list)
  }

  let totalProducts = 0

  for (const category of categories as CategoryRow[]) {
    const config = CATEGORY_CONFIG[category.slug]
    if (!config) {
      console.warn(`No seed config for category "${category.slug}" — skipping`)
      continue
    }

    const attrs = attrsByCategory.get(category.id) ?? []
    const rand = seededRandom(category.slug.length * 7919 + 13)
    const usedNames = new Set<string>()
    const rows: Array<{
      category_id: string
      slug: string
      sku: string
      name: string
      brand: string
      description: string
      price: number
      compare_at_price: number | null
      unit_label: string
      stock_quantity: number
      low_stock_threshold: number
      attributes: Record<string, AttributeValue>
      is_active: boolean
      is_featured: boolean
    }> = []

    for (let i = 0; i < config.count; i++) {
      const brand = config.brands[i % config.brands.length] as string
      const attributeValues: Record<string, AttributeValue> = {}
      for (const attr of attrs) {
        attributeValues[attr.key] = generateAttributeValue(category.slug, attr, i, brand, rand)
      }

      const baseName = config.nameBuilder({ brand, attrs: attributeValues, index: i, categoryName: category.name })
      let name = baseName
      if (usedNames.has(name)) name = `${baseName} — Edition ${i + 1}`
      usedNames.add(name)
      const [minPrice, maxPrice] = config.priceRange
      const price = Math.round(minPrice + rand() * (maxPrice - minPrice))
      const hasDiscount = rand() < 0.3
      const compareAtPrice = hasDiscount ? Math.round(price * (1.1 + rand() * 0.15)) : null
      const stock = i === config.count - 1 ? 0 : Math.round(4 + rand() * 140)

      rows.push({
        category_id: category.id,
        slug: `${slugify(name)}-${config.skuPrefix.toLowerCase()}${i + 1}`,
        sku: `DHJ-${config.skuPrefix}-${String(i + 1).padStart(3, '0')}`,
        name,
        brand,
        description: config.descriptionBuilder({ brand, attrs: attributeValues, categoryName: category.name }),
        price,
        compare_at_price: compareAtPrice,
        unit_label: config.unitLabel,
        stock_quantity: stock,
        low_stock_threshold: 5,
        attributes: attributeValues,
        is_active: true,
        is_featured: i < config.featuredCount,
      })
    }

    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(rows, { onConflict: 'sku' })
      .select('id, slug, sku, name')

    if (upsertError) {
      throw new Error(`Failed to upsert products for ${category.slug}: ${upsertError.message}`)
    }

    console.log(`  ${category.slug}: ${upserted?.length ?? 0} products upserted`)
    totalProducts += upserted?.length ?? 0
  }

  // No image upload here by design — fabricated product photos aren't
  // real photos of anything. Products are created imageless and show the
  // "no image yet" state until a real photo is uploaded via /admin.
  console.log(`\nDone. ${totalProducts} products upserted (no images — upload real photos via admin).`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
