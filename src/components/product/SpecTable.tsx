import { Check, X } from 'lucide-react'
import type { AttributeValue, CategoryAttribute } from '@/types/catalog'

function formatValue(attr: CategoryAttribute, value: AttributeValue | undefined) {
  if (value === undefined || value === null) return '—'

  if (attr.dataType === 'boolean') {
    return value === true ? (
      <span className="inline-flex items-center gap-1 text-success">
        <Check className="size-4" /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-content-muted">
        <X className="size-4" /> No
      </span>
    )
  }

  if (attr.dataType === 'number') {
    return attr.unit ? `${value} ${attr.unit}` : String(value)
  }

  return String(value)
}

export function SpecTable({
  attributes,
  values,
}: {
  attributes: CategoryAttribute[]
  values: Record<string, AttributeValue>
}) {
  const sorted = [...attributes].sort((a, b) => a.sortOrder - b.sortOrder)

  if (!sorted.length) return null

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle">
      <table className="w-full text-sm">
        <tbody>
          {sorted.map((attr, index) => (
            <tr key={attr.id} className={index % 2 === 0 ? 'bg-card' : 'bg-surface'}>
              <th className="w-2/5 px-4 py-3 text-left font-medium text-ink-600">{attr.label}</th>
              <td className="px-4 py-3 text-content">{formatValue(attr, values[attr.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
