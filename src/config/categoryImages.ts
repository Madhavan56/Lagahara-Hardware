import { productImageUrl } from '@/lib/supabase/client'

/**
 * Category tile imagery, kept out of components so it's swappable in one place.
 *
 * Photos are real, freely-licensed images stored locally in
 * public/images/categories/ at two widths (480w/960w) for srcset.
 * Credits live in IMAGE_CREDITS.md.
 *
 * Every category currently has a photo. Categories without one fall back to a
 * flat pastel tint, so the grid still renders one consistent system (same
 * ratio, radius, label). To upgrade a fallback to a photo: drop
 * `<slug>-480.jpg` and `<slug>-960.jpg` into public/images/categories/ and add
 * a `photo` entry below.
 *
 * `tone` drives the pastel card surface, its icon chip and its link colour.
 * The four tones rotate so adjacent cards in the grid never repeat.
 */

export type CategoryTone = 'lavender' | 'sky' | 'mint' | 'peach'

export type CategoryPhoto = {
  /** Largest local variant, used as the `src`. */
  src: string
  /** Width-descriptor srcset across the local variants. */
  srcSet: string
  alt: string
}

export type CategoryTile = {
  photo?: CategoryPhoto
  tone: CategoryTone
  /** Token-backed surface class used when there's no photo yet. */
  fallbackTint: string
}

const TONE_TINT: Record<CategoryTone, string> = {
  lavender: 'bg-pastel-lavender',
  sky: 'bg-pastel-sky',
  mint: 'bg-pastel-mint',
  peach: 'bg-pastel-peach',
}

function photo(slug: string, alt: string): CategoryPhoto {
  return {
    src: `/images/categories/${slug}-960.jpg`,
    srcSet: `/images/categories/${slug}-480.jpg 480w, /images/categories/${slug}-960.jpg 960w`,
    alt,
  }
}

function tile(slug: string, alt: string, tone: CategoryTone): CategoryTile {
  return { photo: photo(slug, alt), tone, fallbackTint: TONE_TINT[tone] }
}

export const CATEGORY_TILES: Record<string, CategoryTile> = {
  plywood: tile('plywood', 'Plywood sheet showing its layered cross-section', 'lavender'),
  'mica-laminates': tile(
    'mica-laminates',
    'White marble-pattern laminate surface with grey veining',
    'sky',
  ),
  'kitchen-hardware': tile('kitchen-hardware', 'Modern fitted kitchen with handleless cabinetry', 'mint'),
  'wardrobe-hardware': tile(
    'wardrobe-hardware',
    'Built-in white wardrobes with glass-panel doors in a bright bedroom',
    'peach',
  ),
  hinges: tile('hinges', 'Soft-close hinge fitted to a kitchen cabinet door', 'lavender'),
  'drawer-systems': tile('drawer-systems', 'Open kitchen drawer with a wooden cutlery organiser', 'sky'),
  'drawer-channels': tile(
    'drawer-channels',
    'Drawer slide rails with mounting wheel detail',
    'mint',
  ),
  'handles-knobs': tile('handles-knobs', 'Brushed steel lever handle with keyed lock', 'peach'),
  'sliding-systems': tile(
    'sliding-systems',
    'Living room with large sliding glass doors opening to a patio',
    'lavender',
  ),
  'locks-security': tile('locks-security', 'Multi-point security door lock with lever handle and key', 'sky'),
  'aluminium-profiles': tile('aluminium-profiles', 'Stacked extruded aluminium profiles', 'mint'),
  'interior-hardware': tile(
    'interior-hardware',
    'Sorted compartments of steel wood screws',
    'peach',
  ),
  'furniture-accessories': tile(
    'furniture-accessories',
    'Small wooden drawer unit with ceramic knobs',
    'lavender',
  ),
}

const DEFAULT_TILE: CategoryTile = { tone: 'lavender', fallbackTint: TONE_TINT.lavender }

/**
 * An admin-uploaded photo (categories.image_path) wins over the bundled one,
 * served through Supabase image transforms at the same two widths.
 */
export function getCategoryTile(
  slug: string,
  uploaded?: { imagePath: string | null; imageAlt: string | null },
): CategoryTile {
  const base = CATEGORY_TILES[slug] ?? DEFAULT_TILE
  if (!uploaded?.imagePath) return base
  const at = (width: number) => productImageUrl(uploaded.imagePath, { width, quality: 80 }) ?? ''
  return {
    ...base,
    photo: {
      src: at(960),
      srcSet: `${at(480)} 480w, ${at(960)} 960w`,
      alt: uploaded.imageAlt ?? base.photo?.alt ?? '',
    },
  }
}
