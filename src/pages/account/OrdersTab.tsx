import { PackageSearch } from 'lucide-react'

export default function OrdersTab() {
  return (
    <div className="rounded-card border border-sand-200 bg-sand-50 p-8 text-center">
      <PackageSearch className="mx-auto size-8 text-sand-400" />
      <p className="mt-3 text-sm text-sand-600">
        Order history arrives once checkout is built (Phase 9).
      </p>
    </div>
  )
}
