import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCategories,
  fetchCategoryAttributes,
  fetchCategoryBySlug,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchProductBySlug,
  fetchProductReviews,
  fetchProductReviewEligibility,
  submitProductReview,
  fetchProductsByIds,
  fetchProductsPage,
  fetchRelatedProducts,
  fetchShippingMethods,
  searchProducts,
  type ProductsPageParams,
} from './api'

export const catalogKeys = {
  categories: ['categories'] as const,
  categoryBySlug: (slug: string) => ['category', slug] as const,
  categoryAttributes: (categoryId: string) => ['category-attributes', categoryId] as const,
  featured: ['products', 'featured'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,
  productsPage: (params: ProductsPageParams) => ['products', 'page', params] as const,
  productBySlug: (slug: string) => ['product', slug] as const,
  related: (categoryId: string, excludeId: string) => ['products', 'related', categoryId, excludeId] as const,
  byIds: (ids: string[]) => ['products', 'by-ids', [...ids].sort()] as const,
  reviews: (productId: string) => ['reviews', productId] as const,
  search: (query: string) => ['products', 'search', query] as const,
  shippingMethods: ['shipping-methods'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.categoryBySlug(slug ?? ''),
    queryFn: () => fetchCategoryBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCategoryAttributes(categoryId: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.categoryAttributes(categoryId ?? ''),
    queryFn: () => fetchCategoryAttributes(categoryId as string),
    enabled: Boolean(categoryId),
    staleTime: 10 * 60 * 1000,
  })
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: catalogKeys.featured,
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useNewArrivals(limit?: number) {
  return useQuery({
    queryKey: catalogKeys.newArrivals,
    queryFn: () => fetchNewArrivals(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductsPage(params: ProductsPageParams) {
  return useQuery({
    queryKey: catalogKeys.productsPage(params),
    queryFn: () => fetchProductsPage(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: catalogKeys.search(query),
    queryFn: () => searchProducts(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
  })
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.productBySlug(slug ?? ''),
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  })
}

export function useRelatedProducts(categoryId: string | undefined, excludeId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: catalogKeys.related(categoryId ?? '', excludeId ?? ''),
    queryFn: () => fetchRelatedProducts(categoryId as string, excludeId as string, limit),
    enabled: Boolean(categoryId && excludeId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.reviews(productId ?? ''),
    queryFn: () => fetchProductReviews(productId as string),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  })
}

export function useProductReviewEligibility(productId: string | undefined, signedIn: boolean) {
  return useQuery({
    queryKey: ['review-eligibility', productId ?? '', signedIn],
    queryFn: () => fetchProductReviewEligibility(productId as string),
    enabled: Boolean(productId && signedIn),
    staleTime: 30 * 1000,
  })
}

export function useSubmitProductReview(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { rating: number; title: string; body: string }) =>
      submitProductReview({ productId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.reviews(productId) })
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', productId] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: catalogKeys.byIds(ids),
    queryFn: () => fetchProductsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 60 * 1000,
  })
}

export function useShippingMethods() {
  return useQuery({
    queryKey: catalogKeys.shippingMethods,
    queryFn: fetchShippingMethods,
    staleTime: 5 * 60 * 1000,
  })
}
