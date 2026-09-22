import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductAttributeFilters, ProductSort } from './api'

const SELECT_PREFIX = 'af_'
const BOOLEAN_PREFIX = 'bf_'

export function useProductFilterState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: ProductAttributeFilters = useMemo(() => {
    const select: Record<string, string[]> = {}
    const boolean: Record<string, boolean> = {}

    for (const key of searchParams.keys()) {
      if (key.startsWith(SELECT_PREFIX)) {
        const attrKey = key.slice(SELECT_PREFIX.length)
        select[attrKey] = searchParams.getAll(key)
      } else if (key.startsWith(BOOLEAN_PREFIX)) {
        const attrKey = key.slice(BOOLEAN_PREFIX.length)
        boolean[attrKey] = searchParams.get(key) === 'true'
      }
    }

    return { select, boolean }
  }, [searchParams])

  const sort = (searchParams.get('sort') as ProductSort | null) ?? 'newest'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  function toggleSelectValue(attrKey: string, value: string) {
    const next = new URLSearchParams(searchParams)
    const paramKey = `${SELECT_PREFIX}${attrKey}`
    const current = next.getAll(paramKey)
    next.delete(paramKey)
    const withoutValue = current.filter((v) => v !== value)
    const nextValues = withoutValue.length === current.length ? [...current, value] : withoutValue
    for (const v of nextValues) next.append(paramKey, v)
    next.delete('page')
    setSearchParams(next)
  }

  function toggleBoolean(attrKey: string) {
    const next = new URLSearchParams(searchParams)
    const paramKey = `${BOOLEAN_PREFIX}${attrKey}`
    if (next.has(paramKey)) {
      next.delete(paramKey)
    } else {
      next.set(paramKey, 'true')
    }
    next.delete('page')
    setSearchParams(next)
  }

  function setSort(nextSort: ProductSort) {
    const next = new URLSearchParams(searchParams)
    if (nextSort === 'newest') {
      next.delete('sort')
    } else {
      next.set('sort', nextSort)
    }
    next.delete('page')
    setSearchParams(next)
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next)
  }

  function clearAll() {
    const next = new URLSearchParams(searchParams)
    for (const key of [...next.keys()]) {
      if (key.startsWith(SELECT_PREFIX) || key.startsWith(BOOLEAN_PREFIX)) next.delete(key)
    }
    next.delete('page')
    setSearchParams(next)
  }

  const activeFilterCount =
    Object.values(filters.select).reduce((sum, values) => sum + values.length, 0) +
    Object.keys(filters.boolean).length

  return { filters, sort, page, setSort, setPage, toggleSelectValue, toggleBoolean, clearAll, activeFilterCount }
}
