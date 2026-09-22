import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 ease-[var(--ease-out-soft)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-brand-800 text-sand-50 hover:bg-brand-700 shadow-card hover:shadow-lift',
        accent: 'bg-brass-500 text-sand-950 hover:bg-brass-400 shadow-card hover:shadow-lift',
        outline: 'border border-sand-300 bg-transparent text-sand-800 hover:border-brand-700 hover:text-brand-800',
        ghost: 'bg-transparent text-sand-700 hover:bg-sand-100 hover:text-sand-900',
        subtle: 'bg-sand-100 text-sand-800 hover:bg-sand-200',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 rounded-lg px-3.5 text-sm',
        md: 'h-11 rounded-xl px-5 text-sm',
        lg: 'h-13 rounded-xl px-7 text-base',
        icon: 'size-11 rounded-xl',
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
  }

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  leadingIcon,
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
    </button>
  )
}

export { buttonVariants }
