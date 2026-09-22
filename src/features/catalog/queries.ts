import { useQuery } from '@tanstack/react-query'
import {
  fetchCategories,
  fetchCategoryAttributes,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchShippingMethods,
} from './api'

export const catalogKeys = {
  categories: ['categories'] as const,
  categoryAttributes: (categoryId: string) => ['category-attributes', categoryId] as const,
  featured: ['products', 'featured'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,
  shippingMethods: ['shipping-methods'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: fetchCategories,
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

export function useShippingMethods() {
  return useQuery({
    queryKey: catalogKeys.shippingMethods,
    queryFn: fetchShippingMethods,
    staleTime: 5 * 60 * 1000,
  })
}
