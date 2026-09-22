import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 ease-[var(--ease-out-soft)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-brass-500 text-white hover:bg-brass-600 shadow-card hover:shadow-lift font-bold',
        accent: 'bg-brand-800 text-sand-50 hover:bg-brand-700 shadow-card hover:shadow-lift',
        outline: 'border-2 border-sand-300 bg-transparent text-sand-800 hover:border-brass-500 hover:text-brass-600',
        ghost: 'bg-transparent text-sand-700 hover:bg-sand-100 hover:text-sand-900',
        subtle: 'bg-sand-100 text-sand-800 hover:bg-sand-200',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 rounded-xl px-3.5 text-sm',
        md: 'h-11 rounded-2xl px-5 text-sm',
        lg: 'h-13 rounded-2xl px-7 text-base',
        icon: 'size-11 rounded-2xl',
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
