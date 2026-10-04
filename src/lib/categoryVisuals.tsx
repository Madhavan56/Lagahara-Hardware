import {
  Archive,
  ArrowLeftRight,
  ChefHat,
  DoorOpen,
  Grip,
  Layers,
  Lock,
  type LucideIcon,
  Rows3,
  Ruler,
  Shirt,
  Sofa,
  Sparkles,
  Wrench,
} from 'lucide-react'

/**
 * The icon for each category, used in the icon chip on category cards and as
 * the no-photo fallback mark. Colour is no longer carried here — the pastel
 * tone lives in config/categoryImages.ts so a category has exactly one
 * source of truth for its tint.
 */
type CategoryVisual = {
  icon: LucideIcon
}

const VISUALS: Record<string, CategoryVisual> = {
  plywood: { icon: Layers },
  'mica-laminates': { icon: Sparkles },
  'kitchen-hardware': { icon: ChefHat },
  'wardrobe-hardware': { icon: Shirt },
  hinges: { icon: DoorOpen },
  'drawer-systems': { icon: Archive },
  'drawer-channels': { icon: Rows3 },
  'handles-knobs': { icon: Grip },
  'sliding-systems': { icon: ArrowLeftRight },
  'locks-security': { icon: Lock },
  'aluminium-profiles': { icon: Ruler },
  'interior-hardware': { icon: Wrench },
  'furniture-accessories': { icon: Sofa },
}

const FALLBACK: CategoryVisual = { icon: Layers }

export function getCategoryVisual(slug: string): CategoryVisual {
  return VISUALS[slug] ?? FALLBACK
}
