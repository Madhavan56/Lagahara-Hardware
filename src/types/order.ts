export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type OrderStatusEvent = {
  id: string
  status: OrderStatus
  note: string | null
  createdAt: string
}

export type OrderItem = {
  id: string
  productId: string | null
  productName: string
  productSlug: string
  productSku: string
  productImagePath: string | null
  unitLabel: string
  unitPrice: number
  gstRate: number
  quantity: number
  lineTotal: number
}

export type OrderShippingAddress = {
  full_name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
}

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  shippingAmount: number
  taxAmount: number
  discountAmount: number
  total: number
  currency: string
  shippingMethodName: string
  shippingMethodDescription: string | null
  shippingEtaDaysMin: number
  shippingEtaDaysMax: number
  shippingAddress: OrderShippingAddress
  customerNote: string | null
  placedAt: string | null
  createdAt: string
  items: OrderItem[]
  statusEvents: OrderStatusEvent[]
}

export type OrderListItem = Pick<
  Order,
  'id' | 'orderNumber' | 'status' | 'paymentStatus' | 'total' | 'createdAt'
> & {
  itemCount: number
  /** First items for the overview card (product names + thumbnails). */
  previewItems: { name: string; imagePath: string | null; quantity: number }[]
  /** Items beyond the preview window. */
  moreCount: number
}
