import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leadingIcon?: ReactNode
  trailingSlot?: ReactNode
  /** `pill` for search-style fields, `rounded` (default) for form fields. */
  shape?: 'rounded' | 'pill'
}

export function Input({
  className,
  label,
  error,
  hint,
  leadingIcon,
  trailingSlot,
  shape = 'rounded',
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-800">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-content-subtle">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full border bg-card px-4 text-sm text-content transition-[border-color,box-shadow] duration-(--duration-fast) placeholder:text-content-subtle',
            // A soft violet halo grows in on focus, alongside the border colour change.
            'focus:border-primary focus:shadow-[0_0_0_4px_rgb(108_77_217/0.14)] focus:outline-none',
            shape === 'pill' ? 'rounded-pill' : 'rounded-md',
            leadingIcon && 'pl-11',
            trailingSlot && 'pr-11',
            error ? 'border-danger' : 'border-border-subtle hover:border-border-strong',
            className,
          )}
          {...props}
        />
        {trailingSlot ? (
          <span className="absolute inset-y-0 right-2 flex items-center">{trailingSlot}</span>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-content-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
