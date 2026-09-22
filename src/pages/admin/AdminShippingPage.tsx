import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateShippingMethod } from '@/features/admin/queries'
import { useShippingMethods } from '@/features/catalog/queries'

export default function AdminShippingPage() {
  const { data: methods, isLoading } = useShippingMethods()
  const updateMethod = useUpdateShippingMethod()
  const [drafts, setDrafts] = useState<Record<string, { name: string; description: string; price: string; etaDaysMin: string; etaDaysMax: string }>>({})
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (methods && Object.keys(drafts).length === 0) {
      const initial: typeof drafts = {}
      for (const m of methods) {
        initial[m.id] = {
          name: m.name,
          description: m.description ?? '',
          price: String(m.price),
          etaDaysMin: String(m.etaDaysMin),
          etaDaysMax: String(m.etaDaysMax),
        }
      }
      setDrafts(initial)
    }
  }, [methods])

  async function save(id: string) {
    const draft = drafts[id]
    if (!draft) return
    await updateMethod.mutateAsync({
      id,
      input: {
        name: draft.name,
        description: draft.description || null,
        price: Number(draft.price) || 0,
        etaDaysMin: Math.max(0, Math.round(Number(draft.etaDaysMin) || 0)),
        etaDaysMax: Math.max(0, Math.round(Number(draft.etaDaysMax) || 0)),
      },
    })
    setSavedId(id)
    window.setTimeout(() => setSavedId(null), 2000)
  }

  if (isLoading) return <p className="text-sm text-sand-500">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-sand-900">Shipping</h1>
      <p className="mt-1 text-sm text-sand-600">
        These two methods are the only shipping options shown at checkout.
      </p>

      <div className="mt-6 space-y-6">
        {methods?.map((method) => {
          const draft = drafts[method.id]
          if (!draft) return null
          return (
            <div key={method.id} className="rounded-card border border-sand-200 bg-white p-5">
              <p className="mb-4 text-xs font-semibold tracking-wide text-sand-500 uppercase">{method.code}</p>
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={draft.name}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [method.id]: { ...draft, name: e.target.value } }))}
                />
                <Input
                  label="Description"
                  value={draft.description}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [method.id]: { ...draft, description: e.target.value } }))}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Price (₹)"
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [method.id]: { ...draft, price: e.target.value } }))}
                  />
                  <Input
                    label="ETA min (days)"
                    type="number"
                    value={draft.etaDaysMin}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [method.id]: { ...draft, etaDaysMin: e.target.value } }))}
                  />
                  <Input
                    label="ETA max (days)"
                    type="number"
                    value={draft.etaDaysMax}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [method.id]: { ...draft, etaDaysMax: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button size="sm" loading={updateMethod.isPending} onClick={() => save(method.id)}>
                  Save
                </Button>
                {savedId === method.id ? <span className="text-sm text-success">Saved</span> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
