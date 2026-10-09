import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition-all duration-200 ease-[var(--ease-out-soft)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px active:scale-[0.98]',
  {
    variants: {
      variant: {
        /** Filled violet — the one CTA on any given view. */
        primary:
          'sheen-sweep bg-primary text-on-primary shadow-primary hover:bg-primary-hover hover:shadow-lift',
        /** Deep violet, for emphasis that must not compete with `primary`. */
        accent: 'sheen-sweep bg-iris-800 text-on-primary shadow-card hover:bg-iris-700 hover:shadow-lift',
        /** Lavender chip — the quiet secondary action next to a primary CTA. */
        soft: 'bg-primary-soft text-primary hover:bg-primary-soft-hover',
        /** Outlined, as in the hero's second CTA. */
        outline:
          'border border-border-strong bg-card text-content hover:border-primary hover:text-primary hover:shadow-card',
        ghost: 'bg-transparent text-ink-700 hover:bg-surface-sunken hover:text-content',
        subtle: 'bg-surface-sunken text-ink-800 hover:bg-ink-200',
        /** White pill for use on gradient or dark panels. */
        inverse: 'focus-ring-light bg-card text-primary shadow-card hover:bg-iris-50',
        danger: 'bg-danger text-on-primary hover:opacity-90',
      },
      size: {
        sm: 'h-9 rounded-pill px-4 text-sm',
        md: 'h-11 rounded-pill px-5 text-sm',
        lg: 'h-13 rounded-pill px-7 text-base',
        icon: 'size-11 rounded-pill',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    leadingIcon?: ReactNode
    trailingIcon?: ReactNode
  }

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

export { buttonVariants }
