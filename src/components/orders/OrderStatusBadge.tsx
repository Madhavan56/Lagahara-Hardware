import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/order'

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'neutral' | 'brand' | 'success' | 'danger' | 'accent' }> = {
  pending: { label: 'Pending', variant: 'neutral' },
  confirmed: { label: 'Confirmed', variant: 'brand' },
  processing: { label: 'Processing', variant: 'brand' },
  shipped: { label: 'Shipped', variant: 'accent' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'accent' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
