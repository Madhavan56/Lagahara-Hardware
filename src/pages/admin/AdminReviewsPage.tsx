import { Star, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAdminReviews, useDeleteReview, useSetReviewApproval } from '@/features/admin/queries'
import { formatDate } from '@/lib/utils'

export default function AdminReviewsPage() {
  const { data: reviews, isLoading } = useAdminReviews()
  const setApproval = useSetReviewApproval()
  const deleteReview = useDeleteReview()

  return (
    <div>
      <h1 className="text-h2 text-content">Reviews</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-content-muted">Loading…</p>
        ) : !reviews?.length ? (
          <p className="text-sm text-content-muted">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-card border border-border-subtle bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${star <= review.rating ? 'fill-iris-500 text-iris-500' : 'text-ink-300'}`}
                        />
                      ))}
                    </div>
                    <Badge variant={review.isApproved ? 'success' : 'neutral'} size="sm">
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-content">{review.productName}</p>
                  {review.title ? <p className="mt-0.5 text-sm text-ink-800">{review.title}</p> : null}
                  {review.body ? <p className="mt-1 text-sm text-ink-600">{review.body}</p> : null}
                  <p className="mt-1.5 text-xs text-content-muted">
                    {review.reviewerName} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setApproval.mutate({ id: review.id, isApproved: !review.isApproved })}
                    className="text-xs font-medium text-iris-700 hover:underline"
                  >
                    {review.isApproved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this review?')) deleteReview.mutate(review.id)
                    }}
                    aria-label="Delete review"
                    className="text-content-subtle hover:text-danger"
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
