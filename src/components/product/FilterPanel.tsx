import { X } from 'lucide-react'
import type { ProductAttributeFilters } from '@/features/catalog/api'
import type { CategoryAttribute } from '@/types/catalog'

export function FilterPanel({
  attributes,
  filters,
  onToggleSelect,
  onToggleBoolean,
  onClear,
  activeFilterCount,
}: {
  attributes: CategoryAttribute[]
  filters: ProductAttributeFilters
  onToggleSelect: (key: string, value: string) => void
  onToggleBoolean: (key: string) => void
  onClear: () => void
  activeFilterCount: number
}) {
  const facetable = attributes.filter(
    (attr) => attr.isFilterable && (attr.dataType === 'select' || attr.dataType === 'boolean'),
  )

  if (!facetable.length) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-content">Filters</h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-iris-700 hover:text-iris-900"
          >
            <X className="size-3.5" />
            Clear ({activeFilterCount})
          </button>
        ) : null}
      </div>

      {facetable.map((attr) => (
        <div key={attr.id} className="border-t border-border-subtle pt-4 first:border-t-0 first:pt-0">
          <p className="mb-2.5 text-sm font-medium text-ink-800">{attr.label}</p>

          {attr.dataType === 'boolean' ? (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={filters.boolean[attr.key] === true}
                onChange={() => onToggleBoolean(attr.key)}
                className="size-4 rounded border-border-strong text-iris-700 focus:ring-iris-600"
              />
              {attr.label} only
            </label>
          ) : (
            <div className="space-y-1.5">
              {attr.options.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={filters.select[attr.key]?.includes(option) ?? false}
                    onChange={() => onToggleSelect(attr.key, option)}
                    className="size-4 rounded border-border-strong text-iris-700 focus:ring-iris-600"
                  />
                  {option}
                  {attr.unit && !Number.isNaN(Number(option)) ? ` ${attr.unit}` : ''}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
