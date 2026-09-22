/**
 * Removes the generated placeholder images from every category except
 * Plywood and Mica & Laminates (which have real, licensed photos applied —
 * see apply-real-images.ts). Leaves those 96 products imageless so the
 * "no image yet" UI state is real and testable, per explicit instruction
 * not to fabricate fake product photos. Admin can upload real photos anytime.
 *
 * Run with: npm run remove:placeholder-images
 */
import { supabaseAdmin } from './lib/admin-client'

const KEEP_CATEGORY_SLUGS = ['plywood', 'mica-laminates']

async function main() {
  const { data: keepCategories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id, slug')
    .in('slug', KEEP_CATEGORY_SLUGS)
  if (catError) throw catError

  const keepCategoryIds = new Set((keepCategories ?? []).map((c) => c.id))
  console.log(`Keeping images for: ${(keepCategories ?? []).map((c) => c.slug).join(', ')}`)

  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, category_id, product_images(id, storage_path)')
  if (prodError) throw prodError

  const toRemove = (products ?? []).filter((p) => !keepCategoryIds.has(p.category_id))
  const imageRows = toRemove.flatMap((p) => p.product_images ?? [])
  const storagePaths = imageRows.map((img) => img.storage_path)
  const imageIds = imageRows.map((img) => img.id)

  console.log(`Removing ${imageIds.length} placeholder images from ${toRemove.length} products…`)

  if (storagePaths.length) {
    // Storage API caps batch remove; chunk to be safe.
    for (let i = 0; i < storagePaths.length; i += 50) {
      const chunk = storagePaths.slice(i, i + 50)
      const { error } = await supabaseAdmin.storage.from('product-images').remove(chunk)
      if (error) console.error('  Storage removal error:', error.message)
    }
  }

  if (imageIds.length) {
    const { error } = await supabaseAdmin.from('product_images').delete().in('id', imageIds)
    if (error) throw error
  }

  console.log(`Done. ${imageIds.length} placeholder image rows and storage objects removed.`)
}

main().catch((err) => {
  console.error('remove-placeholder-images failed:', err)
  process.exit(1)
})
