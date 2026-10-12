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
  fetchAdmins,
  fetchDashboard,
  fetchAdminProduct,
  fetchAdminProducts,
  fetchAdminReviews,
  fetchContactMessages,
  removeCategoryImage,
  reorderProductImages,
  setMessageRead,
  setPrimaryImage,
  setProductActive,
  setUserRole,
  setReviewApproval,
  updateCategory,
  updateCategoryAttribute,
  updateCategoryImageAlt,
  updateImageAlt,
  updateLowStockThreshold,
  updateOrderStatus,
  updateProduct,
  updateShippingMethod,
  updateStock,
  uploadCategoryImage,
  uploadProductImage,
  type CategoryAttributeInput,
  type ProductWriteInput,
} from './api'

const keys = {
  products: (search?: string) => ['admin', 'products', search ?? ''] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  orders: (status?: OrderStatus) => ['admin', 'orders', status ?? 'all'] as const,
  reviews: ['admin', 'reviews'] as const,
  admins: ['admin', 'admins'] as const,
  dashboard: ['admin', 'dashboard'] as const,
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

export function useSetProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductActive(id, isActive),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: keys.product(id) })
    },
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stockQuantity }: { id: string; stockQuantity: number }) => updateStock(id, stockQuantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

export function useUpdateLowStockThreshold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, threshold }: { id: string; threshold: number }) => updateLowStockThreshold(id, threshold),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}

function useInvalidateProduct(productId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: keys.product(productId) })
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
  }
}

export function useUploadProductImage(productId: string) {
  const invalidate = useInvalidateProduct(productId)
  return useMutation({
    mutationFn: (input: {
      categorySlug: string
      file: Blob
      sortOrder: number
      isPrimary: boolean
      altText: string | null
    }) => uploadProductImage({ productId, ...input }),
    onSettled: invalidate,
  })
}

export function useDeleteProductImage(productId: string) {
  const invalidate = useInvalidateProduct(productId)
  return useMutation({
    mutationFn: (image: { id: string; storagePath: string }) => deleteProductImage(image),
    onSettled: invalidate,
  })
}

export function useSetPrimaryImage(productId: string) {
  const invalidate = useInvalidateProduct(productId)
  return useMutation({
    mutationFn: (imageId: string) => setPrimaryImage(imageId),
    onSettled: invalidate,
  })
}

export function useReorderProductImages(productId: string) {
  const invalidate = useInvalidateProduct(productId)
  return useMutation({
    mutationFn: (imageIds: string[]) => reorderProductImages(productId, imageIds),
    onSettled: invalidate,
  })
}

export function useUpdateImageAlt(productId: string) {
  const invalidate = useInvalidateProduct(productId)
  return useMutation({
    mutationFn: ({ imageId, altText }: { imageId: string; altText: string | null }) => updateImageAlt(imageId, altText),
    onSettled: invalidate,
  })
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof uploadCategoryImage>[0]) => uploadCategoryImage(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useRemoveCategoryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, path }: { categoryId: string; path: string }) => removeCategoryImage(categoryId, path),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategoryImageAlt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, altText }: { categoryId: string; altText: string | null }) =>
      updateCategoryImageAlt(categoryId, altText),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useAdmins() {
  return useQuery({ queryKey: keys.admins, queryFn: fetchAdmins })
}

export function useSetUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'admin' | 'customer' }) => setUserRole(email, role),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.admins })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useDashboard() {
  return useQuery({ queryKey: keys.dashboard, queryFn: fetchDashboard, refetchInterval: 60_000 })
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
