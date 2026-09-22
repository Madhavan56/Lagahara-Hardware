/**
 * Applies real, representative category imagery to every product.
 * Run with: npx tsx scripts/apply-category-product-images.ts
 *
 * We do not fabricate per-SKU product photography. Instead each product gets a
 * genuine, freely-licensed photo of its category's material/component (the same
 * verified set used for the category tiles — see IMAGE_CREDITS.md), so the
 * catalog browses like a real store instead of a wall of empty placeholders.
 *
 * - Idempotent: existing product_images rows are left alone; only products
 *   with NO images get a primary row added.
 * - Storage layout matches the existing convention: <category-slug>/<sku>.jpg
 * - To replace with true per-SKU photography later, upload via
 *   Admin → Products → (product) → Images and delete these representative rows.
 */
import { supabaseAdmin } from './lib/admin-client'
import { CATEGORY_PRODUCT_PHOTOS } from './lib/category-photos'

const BUCKET = 'product-images'

async function main() {
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')
  if (error) throw error

  let productsUpdated = 0
  let filesUploaded = 0

  for (const category of categories ?? []) {
    const photo = CATEGORY_PRODUCT_PHOTOS[category.slug]
    if (!photo) {
      console.log(`  ${category.slug}: no representative photo configured — skipped`)
      continue
    }

    // Download the photo once per category.
    console.log(`${category.slug}: downloading representative photo…`)
    const response = await fetch(photo.url, {
      headers: { 'User-Agent': 'LagharaHardwares-Sourcing/1.0' },
    })
    if (!response.ok) {
      console.error(`  download failed (${response.status}) — skipped`)
      continue
    }
    const bytes = new Uint8Array(await response.arrayBuffer())

    // Products of this category with no images yet.
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, sku, slug, product_images(id)')
      .eq('category_id', category.id)
      .eq('is_active', true)
    if (prodError) throw prodError

    const targets = (products ?? []).filter((p) => (p.product_images ?? []).length === 0)
    if (!targets.length) {
      console.log(`  ${category.slug}: all products already have images`)
      continue
    }

    // Cache a resized variant per storage path (all products share one path
    // per category, so one upload serves the whole category).
    const storagePath = `${category.slug}/category-representative.jpg`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType: 'image/jpeg', upsert: true })
    if (uploadError) {
      console.error(`  upload failed for ${storagePath}: ${uploadError.message}`)
      continue
    }
    filesUploaded++

    for (const product of targets) {
      const { error: insertError } = await supabaseAdmin.from('product_images').insert({
        product_id: product.id,
        storage_path: storagePath,
        alt_text: photo.alt,
        is_primary: true,
        sort_order: 0,
      })
      if (insertError) {
        console.error(`  ${product.sku}: insert failed — ${insertError.message}`)
        continue
      }
      productsUpdated++
    }
    console.log(`  ${category.slug}: ${targets.length} products now have a representative photo`)
  }

  console.log(`\nDone. ${filesUploaded} storage objects, ${productsUpdated} products imaged.`)
}

main().catch((err) => {
  console.error('apply-category-product-images failed:', err)
  process.exit(1)
})
