import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore, type ToastTone } from '@/features/toast/store'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

const TONE_ICON = { success: CheckCircle2, info: Info, error: AlertCircle } satisfies Record<ToastTone, unknown>
const TONE_CLASS: Record<ToastTone, string> = {
  success: 'text-success',
  info: 'text-primary',
  error: 'text-danger',
}

/**
 * Renders toasts bottom-centre on phones, bottom-right from `sm` up. Sits
 * above the drawers (z-[60]) and never captures clicks outside the toast.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone]
          return (
            <m.div
              key={toast.id}
              layout="position"
              role="status"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: DURATION.fast } }}
              transition={{ duration: DURATION.base, ease: EASE.expo }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-card p-4 shadow-float"
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', TONE_CLASS[toast.tone])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-content">{toast.title}</p>
                {toast.description ? <p className="mt-0.5 text-sm text-content-muted">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded-pill p-1 text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </m.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
