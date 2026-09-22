import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoryAttribute } from '@/types/catalog'
import type { OrderStatus } from '@/types/order'
import {
  createCategory,
  createCategoryAttribute,
  createProduct,
  deleteCategoryAttribute,
  deleteContactMessage,
  deleteProduct,
  deleteProductImage,
  deleteReview,
  fetchAdminOrders,
  fetchAdminProduct,
  fetchAdminProducts,
  fetchAdminReviews,
  fetchContactMessages,
  setMessageRead,
  setPrimaryImage,
  setReviewApproval,
  updateCategory,
  updateCategoryAttribute,
  updateOrderStatus,
  updateProduct,
  updateShippingMethod,
  updateStock,
  uploadProductImage,
  type CategoryAttributeInput,
  type ProductWriteInput,
} from './api'

const keys = {
  products: (search?: string) => ['admin', 'products', search ?? ''] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  orders: (status?: OrderStatus) => ['admin', 'orders', status ?? 'all'] as const,
  reviews: ['admin', 'reviews'] as const,
}

export function useAdminProducts(search?: string) {
  return useQuery({ queryKey: keys.products(search), queryFn: () => fetchAdminProducts(search) })
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: keys.product(id ?? ''),
    queryFn: () => fetchAdminProduct(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductWriteInput) => createProduct(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductWriteInput) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: keys.product(id) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stockQuantity }: { id: string; stockQuantity: number }) => updateStock(id, stockQuantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useUploadProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      categorySlug,
      file,
      sortOrder,
      isPrimary,
    }: {
      categorySlug: string
      file: File
      sortOrder: number
      isPrimary: boolean
    }) => uploadProductImage(productId, categorySlug, file, sortOrder, isPrimary),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.product(productId) }),
  })
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ imageId, storagePath }: { imageId: string; storagePath: string }) =>
      deleteProductImage(imageId, storagePath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.product(productId) }),
  })
}

export function useSetPrimaryImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => setPrimaryImage(productId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.product(productId) }),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { slug: string; name: string; description: string | null }) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name: string; description: string | null; isActive: boolean } }) =>
      updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useCreateCategoryAttribute(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryAttributeInput) => createCategoryAttribute(categoryId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-attributes', categoryId] }),
  })
}

export function useUpdateCategoryAttribute(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryAttributeInput }) => updateCategoryAttribute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-attributes', categoryId] }),
  })
}

export function useDeleteCategoryAttribute(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategoryAttribute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-attributes', categoryId] }),
  })
}

export function useAdminOrders(status?: OrderStatus) {
  return useQuery({ queryKey: keys.orders(status), queryFn: () => fetchAdminOrders(status) })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })
}

export function useUpdateShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: { name: string; description: string | null; price: number; etaDaysMin: number; etaDaysMax: number }
    }) => updateShippingMethod(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipping-methods'] }),
  })
}

export function useAdminReviews() {
  return useQuery({ queryKey: keys.reviews, queryFn: fetchAdminReviews })
}

export function useSetReviewApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => setReviewApproval(id, isApproved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.reviews }),
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.reviews }),
  })
}

export function useContactMessages() {
  return useQuery({ queryKey: ['admin', 'messages'], queryFn: fetchContactMessages })
}

export function useSetMessageRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => setMessageRead(id, isRead),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  })
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  })
}

export type { CategoryAttribute }
