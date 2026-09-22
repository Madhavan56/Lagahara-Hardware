import { Input } from '@/components/ui/input'
import type { AttributeValue, CategoryAttribute } from '@/types/catalog'

export function DynamicAttributeField({
  attribute,
  value,
  onChange,
}: {
  attribute: CategoryAttribute
  value: AttributeValue | undefined
  onChange: (value: AttributeValue) => void
}) {
  if (attribute.dataType === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-sand-700">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded border-sand-300 text-brand-700"
        />
        {attribute.label}
      </label>
    )
  }

  if (attribute.dataType === 'select') {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-sand-800">
          {attribute.label}
          {attribute.isRequired ? ' *' : ''}
        </label>
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-sand-300 bg-white px-3.5 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="">Select…</option>
          {attribute.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (attribute.dataType === 'number') {
    return (
      <Input
        label={`${attribute.label}${attribute.isRequired ? ' *' : ''}${attribute.unit ? ` (${attribute.unit})` : ''}`}
        type="number"
        value={typeof value === 'number' ? value : ''}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
      />
    )
  }

  return (
    <Input
      label={`${attribute.label}${attribute.isRequired ? ' *' : ''}`}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
