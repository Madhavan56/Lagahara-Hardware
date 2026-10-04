import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The rounded tinted square/circle that carries an icon — used on category
 * cards, the trust strip and anywhere an icon needs a surface of its own.
 */
const chipVariants = cva('inline-flex shrink-0 items-center justify-center', {
  variants: {
    tone: {
      lavender: 'bg-pastel-lavender text-pastel-lavender-ink',
      sky: 'bg-pastel-sky text-pastel-sky-ink',
      mint: 'bg-pastel-mint text-pastel-mint-ink',
      peach: 'bg-pastel-peach text-pastel-peach-ink',
      primary: 'bg-primary-soft text-primary',
      neutral: 'bg-surface-sunken text-ink-600',
      /** For dark or gradient panels. */
      inverse: 'bg-white/15 text-white backdrop-blur-sm',
    },
    size: {
      sm: 'size-8 [&>svg]:size-4',
      md: 'size-11 [&>svg]:size-5',
      lg: 'size-14 [&>svg]:size-6',
    },
    shape: {
      rounded: 'rounded-md',
      circle: 'rounded-pill',
    },
  },
  defaultVariants: {
    tone: 'primary',
    size: 'md',
    shape: 'rounded',
  },
})

type IconChipProps = VariantProps<typeof chipVariants> & {
  icon: LucideIcon
  className?: string
}

export function IconChip({ icon: Icon, tone, size, shape, className }: IconChipProps) {
  return (
    <span className={cn(chipVariants({ tone, size, shape }), className)}>
      <Icon aria-hidden />
    </span>
  )
}

export { chipVariants }
