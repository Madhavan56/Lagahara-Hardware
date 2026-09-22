/**
 * Replaces placeholder product images with verified, real, freely-licensed
 * photos for categories where genuine matches exist (Wikimedia Commons).
 * Same photo per category — these are representative material/texture shots,
 * not literal photos of each distinct SKU (no free source has that).
 * Run with: npm run apply:real-images
 */
import { supabaseAdmin } from './lib/admin-client'

const REAL_IMAGES: { categorySlug: string; url: string; attribution: string }[] = [
  {
    categorySlug: 'plywood',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Plywood.jpg',
    attribution: '"Plywood" — Wikimedia Commons, CC BY 2.0',
  },
  {
    categorySlug: 'mica-laminates',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Formica_Laminate_for_Countertops_01.jpg',
    attribution: '"Formica Laminate for Countertops 01" — Wikimedia Commons, CC BY-SA 4.0',
  },
]

async function main() {
  for (const entry of REAL_IMAGES) {
    console.log(`\n${entry.categorySlug}: downloading…`)
    const response = await fetch(entry.url, {
      headers: { 'User-Agent': 'LagharaHardwares-Sourcing/1.0' },
    })
    if (!response.ok) {
      console.error(`  Failed to download (${response.status})`)
      continue
    }
    const bytes = new Uint8Array(await response.arrayBuffer())

    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', entry.categorySlug)
      .single()
    if (!category) {
      console.error(`  Category ${entry.categorySlug} not found`)
      continue
    }

    const { data: images } = await supabaseAdmin
      .from('product_images')
      .select('storage_path, products!inner(category_id)')
      .eq('products.category_id', category.id)

    if (!images?.length) {
      console.error(`  No product images found for ${entry.categorySlug}`)
      continue
    }

    for (const image of images) {
      const { error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(image.storage_path, bytes, { contentType: 'image/jpeg', upsert: true })
      if (error) {
        console.error(`  Failed to upload ${image.storage_path}:`, error.message)
      }
    }
    console.log(`  Replaced ${images.length} images. Source: ${entry.attribution}`)
  }
}

main().catch((err) => {
  console.error('apply-real-images failed:', err)
  process.exit(1)
})
