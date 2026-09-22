import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCreateCategoryAttribute,
  useDeleteCategoryAttribute,
  useUpdateCategoryAttribute,
} from '@/features/admin/queries'
import { useCategoryAttributes } from '@/features/catalog/queries'
import type { CategoryAttribute } from '@/types/catalog'

const DATA_TYPES: CategoryAttribute['dataType'][] = ['text', 'number', 'boolean', 'select']

type DraftAttribute = {
  key: string
  label: string
  dataType: CategoryAttribute['dataType']
  unit: string
  optionsText: string
  isRequired: boolean
  isFilterable: boolean
}

const emptyDraft: DraftAttribute = {
  key: '',
  label: '',
  dataType: 'text',
  unit: '',
  optionsText: '',
  isRequired: false,
  isFilterable: true,
}

export function CategoryAttributeEditor({ categoryId }: { categoryId: string }) {
  const { data: attributes = [], isLoading } = useCategoryAttributes(categoryId)
  const createAttr = useCreateCategoryAttribute(categoryId)
  const updateAttr = useUpdateCategoryAttribute(categoryId)
  const deleteAttr = useDeleteCategoryAttribute(categoryId)

  const [draft, setDraft] = useState<DraftAttribute | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startCreate() {
    setDraft(emptyDraft)
    setEditingId(null)
    setError(null)
  }

  function startEdit(attr: CategoryAttribute) {
    setDraft({
      key: attr.key,
      label: attr.label,
      dataType: attr.dataType,
      unit: attr.unit ?? '',
      optionsText: attr.options.join(', '),
      isRequired: attr.isRequired,
      isFilterable: attr.isFilterable,
    })
    setEditingId(attr.id)
    setError(null)
  }

  async function saveDraft() {
    if (!draft) return
    setError(null)

    if (!/^[a-z][a-z0-9_]*$/.test(draft.key)) {
      return setError('Key must be lowercase letters, numbers and underscores, starting with a letter')
    }
    if (!draft.label.trim()) return setError('Label is required')

    const options = draft.optionsText
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
    if (draft.dataType === 'select' && options.length === 0) {
      return setError('Select-type attributes need at least one option')
    }

    const input = {
      key: draft.key,
      label: draft.label.trim(),
      dataType: draft.dataType,
      unit: draft.unit.trim() || null,
      options,
      isRequired: draft.isRequired,
      isFilterable: draft.isFilterable,
      sortOrder: attributes.length,
    }

    try {
      if (editingId) {
        await updateAttr.mutateAsync({ id: editingId, input })
      } else {
        await createAttr.mutateAsync(input)
      }
      setDraft(null)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save attribute')
    }
  }

  if (isLoading) return <p className="text-sm text-sand-500">Loading attributes…</p>

  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-sand-500 uppercase">
          <tr>
            <th className="py-2">Key</th>
            <th className="py-2">Label</th>
            <th className="py-2">Type</th>
            <th className="py-2">Options</th>
            <th className="py-2">Required</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.id} className="border-t border-sand-100">
              <td className="py-2 font-mono text-xs text-sand-600">{attr.key}</td>
              <td className="py-2 text-sand-900">{attr.label}</td>
              <td className="py-2 text-sand-600">{attr.dataType}</td>
              <td className="py-2 text-sand-600">{attr.options.join(', ') || '—'}</td>
              <td className="py-2 text-sand-600">{attr.isRequired ? 'Yes' : 'No'}</td>
              <td className="py-2 text-right">
                <button type="button" onClick={() => startEdit(attr)} className="mr-3 text-xs font-medium text-brand-700 hover:underline">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete attribute "${attr.label}"? Existing products keep the data but it won't be editable here.`)) {
                      deleteAttr.mutate(attr.id)
                    }
                  }}
                  className="text-xs font-medium text-danger hover:underline"
                  aria-label={`Delete attribute ${attr.label}`}
                >
                  <Trash2 className="inline size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draft ? (
        <div className="space-y-3 rounded-lg border border-sand-200 bg-sand-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Key (machine name)"
              value={draft.key}
              disabled={Boolean(editingId)}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              hint="e.g. thickness, mounting_type"
            />
            <Input label="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-sand-800">Data type</label>
              <select
                value={draft.dataType}
                onChange={(e) => setDraft({ ...draft, dataType: e.target.value as CategoryAttribute['dataType'] })}
                className="h-11 w-full rounded-xl border border-sand-300 bg-white px-3.5 text-sm focus:border-brand-600 focus:outline-none"
              >
                {DATA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Unit (optional)" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} hint="e.g. mm, kg, °" />
          </div>
          {draft.dataType === 'select' ? (
            <Input
              label="Options (comma-separated)"
              value={draft.optionsText}
              onChange={(e) => setDraft({ ...draft, optionsText: e.target.value })}
              hint="e.g. MR, BWR, BWP, Marine"
            />
          ) : null}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-sand-700">
              <input type="checkbox" checked={draft.isRequired} onChange={(e) => setDraft({ ...draft, isRequired: e.target.checked })} className="size-4 rounded border-sand-300 text-brand-700" />
              Required
            </label>
            <label className="flex items-center gap-2 text-sm text-sand-700">
              <input type="checkbox" checked={draft.isFilterable} onChange={(e) => setDraft({ ...draft, isFilterable: e.target.checked })} className="size-4 rounded border-sand-300 text-brand-700" />
              Filterable in shop
            </label>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-3">
            <Button type="button" size="sm" loading={createAttr.isPending || updateAttr.isPending} onClick={saveDraft}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" leadingIcon={<Plus className="size-3.5" />} onClick={startCreate}>
          Add attribute
        </Button>
      )}
    </div>
  )
}
