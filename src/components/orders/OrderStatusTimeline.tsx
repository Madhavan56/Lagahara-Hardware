import { Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { OrderStatusEvent } from '@/types/order'
import { OrderStatusBadge } from './OrderStatusBadge'

export function OrderStatusTimeline({ events }: { events: OrderStatusEvent[] }) {
  if (!events.length) return null

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute top-6 left-3 h-full w-px -translate-x-1/2 bg-sand-200" aria-hidden />
            ) : null}
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sand-50">
              <Check className="size-3.5" />
            </span>
            <div>
              <OrderStatusBadge status={event.status} />
              <p className="mt-1 text-xs text-sand-500">{formatDate(event.createdAt)}</p>
              {event.note ? <p className="mt-1 text-sm text-sand-600">{event.note}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
