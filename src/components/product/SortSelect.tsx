import type { ProductSort } from '@/features/catalog/api'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export function SortSelect({
  value,
  onChange,
}: {
  value: ProductSort
  onChange: (sort: ProductSort) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as ProductSort)}
      aria-label="Sort products"
      className="h-10 rounded-lg border border-sand-300 bg-white px-3 text-sm text-sand-800 focus:border-brand-600 focus:outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
