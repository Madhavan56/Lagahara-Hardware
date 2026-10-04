import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * The solid pill that sits on a product image tile. Every tone is a filled
 * colour with white text, each verified at WCAG AA for small bold text.
 */
const statusPillVariants = cva(
  'inline-flex items-center rounded-pill px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide whitespace-nowrap text-on-primary shadow-xs',
  {
    variants: {
      tone: {
        new: 'bg-pill-new', // 5.67:1
        best: 'bg-pill-best', // 4.62:1
        sale: 'bg-pill-sale', // 5.17:1
        discount: 'bg-pill-discount', // 4.83:1
        muted: 'bg-ink-700', // out of stock
      },
    },
    defaultVariants: {
      tone: 'new',
    },
  },
)

type StatusPillProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof statusPillVariants>

export function StatusPill({ className, tone, ...props }: StatusPillProps) {
  return <span className={cn(statusPillVariants({ tone }), className)} {...props} />
}

/** Days a product counts as "New" after it is created. */
const NEW_WINDOW_DAYS = 30

type StatusSource = {
  stockQuantity: number
  price: number
  compareAtPrice: number | null
  isFeatured?: boolean
  createdAt?: string
}

/**
 * Derives the single most important pill for a product from real catalogue
 * data — never decorative. Priority: availability, then price, then merch
 * flags. Returns null when nothing is worth surfacing.
 */
export function deriveProductStatus(
  product: StatusSource,
): { tone: 'new' | 'best' | 'sale' | 'discount' | 'muted'; label: string } | null {
  if (product.stockQuantity === 0) return { tone: 'muted', label: 'Out of stock' }

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    const pct = Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
    )
    if (pct > 0) return { tone: 'discount', label: `−${pct}% off` }
  }

  if (product.isFeatured) return { tone: 'best', label: 'Best Seller' }

  if (product.createdAt) {
    const ageMs = Date.now() - new Date(product.createdAt).getTime()
    if (ageMs >= 0 && ageMs < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
      return { tone: 'new', label: 'New' }
    }
  }

  return null
}

export { statusPillVariants }
