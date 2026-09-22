/**
 * Generates public/sitemap.xml from live categories and products.
 * Run before each production build/deploy: npm run generate:sitemap
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { supabaseAdmin } from './lib/admin-client'

const SITE_URL = process.env.SITE_URL ?? 'https://lagharahardwares.com'

function urlEntry(path: string, priority: string, changefreq: string) {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  const { data: categories, error: categoriesError } = await supabaseAdmin
    .from('categories')
    .select('slug')
    .eq('is_active', true)
  if (categoriesError) throw categoriesError

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('slug')
    .eq('is_active', true)
  if (productsError) throw productsError

  const entries = [
    urlEntry('/', '1.0', 'daily'),
    urlEntry('/shop', '0.9', 'daily'),
    urlEntry('/about', '0.5', 'monthly'),
    urlEntry('/contact', '0.5', 'monthly'),
    ...(categories ?? []).map((c) => urlEntry(`/category/${c.slug}`, '0.8', 'weekly')),
    ...(products ?? []).map((p) => urlEntry(`/product/${p.slug}`, '0.6', 'weekly')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  const outPath = resolve(process.cwd(), 'public/sitemap.xml')
  writeFileSync(outPath, xml, 'utf-8')
  console.log(`Wrote ${entries.length} URLs to public/sitemap.xml`)
}

main().catch((err) => {
  console.error('generate-sitemap failed:', err)
  process.exit(1)
})
