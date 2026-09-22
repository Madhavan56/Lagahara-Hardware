import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium tracking-wide whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-sand-100 text-sand-700',
        brand: 'bg-brand-50 text-brand-800',
        accent: 'bg-brass-100 text-brass-800',
        success: 'bg-emerald-50 text-success',
        danger: 'bg-red-50 text-danger',
        solid: 'bg-brand-800 text-sand-50',
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
