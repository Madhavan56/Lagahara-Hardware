import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * The one surface primitive. Replaces the ad-hoc
 * `rounded-card border bg-card shadow-card` markup that was copy-pasted
 * across pages, so radius and elevation can never drift between sections.
 */
const cardVariants = cva('rounded-card', {
  variants: {
    variant: {
      /** White card on the page background — the default everywhere. */
      surface: 'bg-card shadow-card',
      /** Flat, for dense lists and admin tables where elevation would be noise. */
      flat: 'bg-card border border-border-subtle',
      /** Light-grey tile used behind product imagery. */
      sunken: 'bg-surface-sunken',
      /** Lavender, for the quieter informational panels. */
      soft: 'bg-primary-soft',
      lavender: 'bg-pastel-lavender',
      sky: 'bg-pastel-sky',
      mint: 'bg-pastel-mint',
      peach: 'bg-pastel-peach',
    },
    size: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6 sm:p-8',
    },
    /** Adds the hover lift used on anything clickable. */
    interactive: {
      true: 'transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift',
    },
  },
  defaultVariants: {
    variant: 'surface',
    size: 'md',
  },
})

type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

export function Card({ className, variant, size, interactive, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, size, interactive }), className)} {...props} />
}

export { cardVariants }
