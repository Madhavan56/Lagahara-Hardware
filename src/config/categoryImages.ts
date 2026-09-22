/**
 * Category tile imagery, kept out of components so it's swappable in one place.
 *
 * Photos are real, freely-licensed images stored locally in
 * public/images/categories/ at two widths (480w/960w) for srcset.
 * Credits live in IMAGE_CREDITS.md.
 *
 * Categories without a photo fall back to a branded gradient tile — the grid
 * still renders one consistent system (same ratio, radius, scrim, label).
 * To upgrade a fallback to a photo: drop `<slug>-480.jpg` and `<slug>-960.jpg`
 * into public/images/categories/ and add a `photo` entry below.
 */

export type CategoryPhoto = {
  /** Largest local variant, used as the `src`. */
  src: string
  /** Width-descriptor srcset across the local variants. */
  srcSet: string
  alt: string
}

export type CategoryTile = {
  photo?: CategoryPhoto
  /** Tailwind gradient classes used when there's no photo yet. */
  fallbackGradient: string
}

function photo(slug: string, alt: string): CategoryPhoto {
  return {
    src: `/images/categories/${slug}-960.jpg`,
    srcSet: `/images/categories/${slug}-480.jpg 480w, /images/categories/${slug}-960.jpg 960w`,
    alt,
  }
}

export const CATEGORY_TILES: Record<string, CategoryTile> = {
  plywood: {
    photo: photo('plywood', 'Plywood sheet showing its layered cross-section'),
    fallbackGradient: 'from-orange-600 to-orange-900',
  },
  'mica-laminates': {
    photo: photo('mica-laminates', 'Decorative laminate sheet with a stone-pattern finish'),
    fallbackGradient: 'from-fuchsia-600 to-fuchsia-900',
  },
  'kitchen-hardware': {
    photo: photo('kitchen-hardware', 'Modern fitted kitchen with handleless cabinetry'),
    fallbackGradient: 'from-emerald-600 to-emerald-900',
  },
  'wardrobe-hardware': {
    photo: photo('wardrobe-hardware', 'Bedroom wardrobe with mirrored sliding doors and internal storage'),
    fallbackGradient: 'from-sky-600 to-sky-900',
  },
  hinges: {
    fallbackGradient: 'from-violet-600 to-violet-900',
  },
  'drawer-systems': {
    fallbackGradient: 'from-amber-600 to-amber-900',
  },
  'drawer-channels': {
    fallbackGradient: 'from-teal-600 to-teal-900',
  },
  'handles-knobs': {
    fallbackGradient: 'from-rose-600 to-rose-900',
  },
  'sliding-systems': {
    photo: photo('sliding-systems', 'Living room with large sliding glass doors opening to a patio'),
    fallbackGradient: 'from-cyan-600 to-cyan-900',
  },
  'locks-security': {
    photo: photo('locks-security', 'Brass security latch fitted to a door'),
    fallbackGradient: 'from-indigo-600 to-indigo-900',
  },
  'aluminium-profiles': {
    fallbackGradient: 'from-lime-700 to-lime-900',
  },
  'interior-hardware': {
    photo: photo('interior-hardware', 'Assorted hand tools and fittings on a workshop wall'),
    fallbackGradient: 'from-yellow-700 to-yellow-900',
  },
  'furniture-accessories': {
    photo: photo('furniture-accessories', 'Carpentry workshop with furniture being assembled'),
    fallbackGradient: 'from-pink-600 to-pink-900',
  },
}

const DEFAULT_TILE: CategoryTile = { fallbackGradient: 'from-brass-600 to-brand-800' }

export function getCategoryTile(slug: string): CategoryTile {
  return CATEGORY_TILES[slug] ?? DEFAULT_TILE
}
