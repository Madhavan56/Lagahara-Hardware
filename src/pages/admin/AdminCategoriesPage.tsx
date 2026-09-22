import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useState } from 'react'
import { CategoryAttributeEditor } from '@/components/admin/CategoryAttributeEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateCategory } from '@/features/admin/queries'
import { useCategories } from '@/features/catalog/queries'
import { slugify } from '@/lib/utils'

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreate() {
    setCreateError(null)
    if (!newName.trim()) return setCreateError('Name is required')
    try {
      await createCategory.mutateAsync({
        slug: slugify(newName),
        name: newName.trim(),
        description: newDescription.trim() || null,
      })
      setNewName('')
      setNewDescription('')
      setCreating(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create category')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-sand-900">Categories</h1>
        <Button size="sm" leadingIcon={<Plus className="size-3.5" />} onClick={() => setCreating((v) => !v)}>
          New category
        </Button>
      </div>

      {creating ? (
        <div className="mt-4 space-y-3 rounded-card border border-sand-200 bg-white p-5">
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          {createError ? <p className="text-sm text-danger">{createError}</p> : null}
          <Button size="sm" loading={createCategory.isPending} onClick={handleCreate}>
            Create
          </Button>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-sand-500">Loading…</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="rounded-card border border-sand-200 bg-white">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                aria-expanded={expandedId === category.id}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-medium text-sand-900">{category.name}</p>
                  <p className="text-xs text-sand-500">{category.description}</p>
                </div>
                {expandedId === category.id ? (
                  <ChevronUp className="size-4 text-sand-500" />
                ) : (
                  <ChevronDown className="size-4 text-sand-500" />
                )}
              </button>
              {expandedId === category.id ? (
                <div className="border-t border-sand-200 p-4">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-sand-500 uppercase">
                    Specification schema
                  </p>
                  <CategoryAttributeEditor categoryId={category.id} />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
