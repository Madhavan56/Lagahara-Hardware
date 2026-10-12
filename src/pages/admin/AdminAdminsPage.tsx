import { ShieldCheck, UserMinus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmins, useSetUserRole } from '@/features/admin/queries'
import { useAuth } from '@/features/auth/AuthProvider'
import { showToast } from '@/features/toast/store'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminAdminsPage() {
  const { user } = useAuth()
  const { data: admins, isLoading, error } = useAdmins()
  const setRole = useSetUserRole()
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const isLastAdmin = (admins?.length ?? 0) <= 1

  function promote(event: FormEvent) {
    event.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFormError('Enter a valid email address.')
      return
    }
    if (admins?.some((a) => a.email.toLowerCase() === trimmed)) {
      setFormError('That account is already an admin.')
      return
    }
    setFormError(null)
    setRole.mutate(
      { email: trimmed, role: 'admin' },
      {
        onSuccess: () => {
          setEmail('')
          showToast({ tone: 'success', title: `${trimmed} is now an admin` })
        },
        onError: (err) => setFormError(err.message),
      },
    )
  }

  function demote(adminEmail: string, isSelf: boolean) {
    const message = isSelf
      ? 'Remove your own admin access? You will lose access to this dashboard immediately.'
      : `Remove admin access for ${adminEmail}? They will become a regular customer.`
    if (!confirm(message)) return
    setRole.mutate(
      { email: adminEmail, role: 'customer' },
      {
        onSuccess: () => showToast({ tone: 'success', title: `${adminEmail} is no longer an admin` }),
        onError: (err) => showToast({ tone: 'error', title: err.message }),
      },
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-h2 text-content">Manage admins</h1>
      <p className="mt-1 text-sm text-content-muted">
        Admins can manage products, orders and other admins. The account must already be registered on the store.
      </p>

      <form onSubmit={promote} className="mt-6 flex flex-col gap-3 rounded-card border border-border-subtle bg-card p-5 sm:flex-row sm:items-end">
        <Input
          label="Promote a registered user"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={formError ?? undefined}
          autoComplete="off"
        />
        <Button type="submit" loading={setRole.isPending} leadingIcon={<ShieldCheck className="size-4" />} className="shrink-0 sm:mb-[1px]">
          Make admin
        </Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-border-subtle bg-card">
        <div className="border-b border-border-subtle bg-surface px-4 py-3 text-xs font-semibold text-content-muted uppercase">
          Current admins
        </div>
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-content-muted">Loading…</p>
        ) : error ? (
          <p className="px-4 py-6 text-center text-sm text-danger">Could not load admins.</p>
        ) : (
          <ul>
            {(admins ?? []).map((admin) => {
              const isSelf = admin.id === user?.id
              return (
                <li key={admin.id} className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-content">
                      {admin.fullName || admin.email}
                      {isSelf ? <span className="ml-2 text-xs font-medium text-primary">(you)</span> : null}
                    </p>
                    <p className="truncate text-xs text-content-muted">{admin.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLastAdmin || setRole.isPending}
                    title={isLastAdmin ? 'The last remaining admin cannot be removed' : undefined}
                    onClick={() => demote(admin.email, isSelf)}
                    leadingIcon={<UserMinus className="size-4" />}
                  >
                    Remove
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {isLastAdmin && admins?.length ? (
        <p className="mt-3 text-xs text-content-muted">
          There must always be at least one admin, so the last one can't be removed. Promote someone else first.
        </p>
      ) : null}
    </div>
  )
}
