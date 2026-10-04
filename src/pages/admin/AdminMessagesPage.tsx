import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useContactMessages, useDeleteContactMessage, useSetMessageRead } from '@/features/admin/queries'
import { formatDate } from '@/lib/utils'

export default function AdminMessagesPage() {
  const { data: messages, isLoading } = useContactMessages()
  const setRead = useSetMessageRead()
  const deleteMessage = useDeleteContactMessage()

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-content">Messages</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-content-muted">Loading…</p>
        ) : !messages?.length ? (
          <p className="text-sm text-content-muted">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-card border border-border-subtle bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-content">{msg.name}</p>
                    {!msg.isRead ? <Badge variant="accent" size="sm">New</Badge> : null}
                  </div>
                  <p className="text-xs text-content-muted">
                    {msg.email} {msg.phone ? `· ${msg.phone}` : ''} · {formatDate(msg.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-ink-700">{msg.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setRead.mutate({ id: msg.id, isRead: !msg.isRead })}
                    className="text-content-subtle hover:text-primary"
                    aria-label={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                    title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {msg.isRead ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this message?')) deleteMessage.mutate(msg.id)
                    }}
                    className="text-content-subtle hover:text-danger"
                    aria-label="Delete message"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
