/**
 * Gives every product its own real photo (one distinct, freely-licensed photo
 * per SKU; sources and licences in scripts/data/product-photos.json and
 * IMAGE_CREDITS.md).
 *
 * Run with: npx tsx scripts/apply-unique-product-photos.ts <dir-of-SKU.jpg-files>
 *
 * - Uploads <dir>/<SKU>.jpg to product-images/<category-slug>/<SKU>-photo.jpg
 * - Points the product's primary image row at it and sets the alt text
 * - Leaves the previous storage objects in place (nothing is deleted)
 * - Idempotent: re-running just re-uploads (upsert) and re-points the row
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { supabaseAdmin } from './lib/admin-client'

const BUCKET = 'product-images'

async function main() {
  const dir = process.argv[2]
  if (!dir) throw new Error('Usage: tsx scripts/apply-unique-product-photos.ts <dir>')

  const manifest = JSON.parse(readFileSync(join(import.meta.dirname, 'data', 'product-photos.json'), 'utf8')) as Record<
    string,
    { title: string }
  >

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, categories(slug), product_images(id, is_primary, sort_order)')
  if (error) throw error

  let updated = 0
  for (const product of products ?? []) {
    if (!manifest[product.sku]) {
      console.log(`  ${product.sku}: no photo in manifest, skipped`)
      continue
    }
    const file = join(dir, `${product.sku}.jpg`)
    if (!existsSync(file)) throw new Error(`${product.sku}: ${file} missing`)

    const path = `${product.categories!.slug}/${product.sku}-photo.jpg`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, readFileSync(file), { contentType: 'image/jpeg', upsert: true })
    if (uploadError) throw new Error(`${product.sku}: upload failed — ${uploadError.message}`)

    const images = [...product.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    const primary = images[0]
    const row = { storage_path: path, alt_text: product.name }
    const { error: rowError } = primary
      ? await supabaseAdmin.from('product_images').update(row).eq('id', primary.id)
      : await supabaseAdmin.from('product_images').insert({ ...row, product_id: product.id, is_primary: true, sort_order: 0 })
    if (rowError) throw new Error(`${product.sku}: row update failed — ${rowError.message}`)

    updated++
    process.stdout.write('.')
  }
  console.log(`\nDone: ${updated} products now have their own photo.`)
}

main().catch((err) => {
  console.error('apply-unique-product-photos failed:', err)
  process.exit(1)
})
