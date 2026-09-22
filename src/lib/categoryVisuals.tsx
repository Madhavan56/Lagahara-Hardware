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

type CategoryVisual = {
  icon: LucideIcon
  bg: string
  fg: string
}

const VISUALS: Record<string, CategoryVisual> = {
  plywood: { icon: Layers, bg: 'bg-orange-100', fg: 'text-orange-600' },
  'mica-laminates': { icon: Sparkles, bg: 'bg-fuchsia-100', fg: 'text-fuchsia-600' },
  'kitchen-hardware': { icon: ChefHat, bg: 'bg-emerald-100', fg: 'text-emerald-600' },
  'wardrobe-hardware': { icon: Shirt, bg: 'bg-sky-100', fg: 'text-sky-600' },
  hinges: { icon: DoorOpen, bg: 'bg-violet-100', fg: 'text-violet-600' },
  'drawer-systems': { icon: Archive, bg: 'bg-amber-100', fg: 'text-amber-700' },
  'drawer-channels': { icon: Rows3, bg: 'bg-teal-100', fg: 'text-teal-600' },
  'handles-knobs': { icon: Grip, bg: 'bg-rose-100', fg: 'text-rose-600' },
  'sliding-systems': { icon: ArrowLeftRight, bg: 'bg-cyan-100', fg: 'text-cyan-600' },
  'locks-security': { icon: Lock, bg: 'bg-indigo-100', fg: 'text-indigo-600' },
  'aluminium-profiles': { icon: Ruler, bg: 'bg-lime-100', fg: 'text-lime-700' },
  'interior-hardware': { icon: Wrench, bg: 'bg-yellow-100', fg: 'text-yellow-700' },
  'furniture-accessories': { icon: Sofa, bg: 'bg-pink-100', fg: 'text-pink-600' },
}

const FALLBACK: CategoryVisual = { icon: Layers, bg: 'bg-sand-200', fg: 'text-sand-600' }

export function getCategoryVisual(slug: string): CategoryVisual {
  return VISUALS[slug] ?? FALLBACK
}
