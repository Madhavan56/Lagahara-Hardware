import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill font-bold tracking-wide whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-sunken text-ink-700',
        brand: 'bg-primary-soft text-iris-700',
        accent: 'bg-iris-100 text-iris-800',
        success: 'bg-success-surface text-success',
        warning: 'bg-warning-surface text-warning',
        danger: 'bg-danger-surface text-danger',
        solid: 'bg-primary text-on-primary',
      },
      size: {
        sm: 'px-2 py-0.5 text-[0.6875rem]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
