import { supabase } from '@/lib/supabase/client'
import type { Order, OrderItem, OrderListItem, OrderShippingAddress, OrderStatusEvent } from '@/types/order'

type Row = Record<string, unknown>

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}
function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function mapOrderItem(row: Row): OrderItem {
  return {
    id: asString(row.id),
    productId: asNullableString(row.product_id),
    productName: asString(row.product_name),
    productSlug: asString(row.product_slug),
    productSku: asString(row.product_sku),
    productImagePath: asNullableString(row.product_image_path),
    unitLabel: asString(row.unit_label) || 'piece',
    unitPrice: asNumber(row.unit_price),
    gstRate: asNumber(row.gst_rate),
    quantity: asNumber(row.quantity),
    lineTotal: asNumber(row.line_total),
  }
}

function mapStatusEvent(row: Row): OrderStatusEvent {
  return {
    id: asString(row.id),
    status: asString(row.status) as OrderStatusEvent['status'],
    note: asNullableString(row.note),
    createdAt: asString(row.created_at),
  }
}

const ORDER_DETAIL_SELECT = `
  id, order_number, status, payment_status, subtotal, shipping_amount, tax_amount,
  discount_amount, total, currency, shipping_method_name, shipping_method_description,
  shipping_eta_days_min, shipping_eta_days_max, shipping_address, customer_note,
  placed_at, created_at,
  order_items(id, product_id, product_name, product_slug, product_sku, product_image_path, unit_label, unit_price, gst_rate, quantity, line_total),
  order_status_events(id, status, note, created_at)
`

function mapOrder(row: Row): Order {
  const items = Array.isArray(row.order_items) ? (row.order_items as Row[]) : []
  const events = Array.isArray(row.order_status_events) ? (row.order_status_events as Row[]) : []

  return {
    id: asString(row.id),
    orderNumber: asString(row.order_number),
    status: asString(row.status) as Order['status'],
    paymentStatus: asString(row.payment_status) as Order['paymentStatus'],
    subtotal: asNumber(row.subtotal),
    shippingAmount: asNumber(row.shipping_amount),
    taxAmount: asNumber(row.tax_amount),
    discountAmount: asNumber(row.discount_amount),
    total: asNumber(row.total),
    currency: asString(row.currency) || 'INR',
    shippingMethodName: asString(row.shipping_method_name),
    shippingMethodDescription: asNullableString(row.shipping_method_description),
    shippingEtaDaysMin: asNumber(row.shipping_eta_days_min),
    shippingEtaDaysMax: asNumber(row.shipping_eta_days_max),
    shippingAddress: row.shipping_address as OrderShippingAddress,
    customerNote: asNullableString(row.customer_note),
    placedAt: asNullableString(row.placed_at),
    createdAt: asString(row.created_at),
    items: items.map(mapOrderItem),
    statusEvents: events
      .map(mapStatusEvent)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  }
}

export async function fetchMyOrders(): Promise<OrderListItem[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, order_items(id)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: asString(row.id),
    orderNumber: asString(row.order_number),
    status: asString(row.status) as OrderListItem['status'],
    paymentStatus: asString(row.payment_status) as OrderListItem['paymentStatus'],
    total: asNumber(row.total),
    createdAt: asString(row.created_at),
    itemCount: Array.isArray(row.order_items) ? row.order_items.length : 0,
  }))
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select(ORDER_DETAIL_SELECT).eq('id', orderId).maybeSingle()
  if (error) throw error
  return data ? mapOrder(data) : null
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('order_number', orderNumber)
    .maybeSingle()
  if (error) throw error
  return data ? mapOrder(data) : null
}

export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_order', { p_order_id: orderId })
  if (error) throw error
}
