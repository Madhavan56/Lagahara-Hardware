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
      <h1 className="text-2xl font-extrabold text-sand-900">Messages</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-sand-500">Loading…</p>
        ) : !messages?.length ? (
          <p className="text-sm text-sand-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-card border border-sand-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sand-900">{msg.name}</p>
                    {!msg.isRead ? <Badge variant="accent" size="sm">New</Badge> : null}
                  </div>
                  <p className="text-xs text-sand-500">
                    {msg.email} {msg.phone ? `· ${msg.phone}` : ''} · {formatDate(msg.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-sand-700">{msg.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setRead.mutate({ id: msg.id, isRead: !msg.isRead })}
                    className="text-sand-400 hover:text-brass-600"
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
                    className="text-sand-400 hover:text-danger"
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
