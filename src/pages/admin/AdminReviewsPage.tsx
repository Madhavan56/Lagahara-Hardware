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
      <h1 className="font-display text-2xl font-semibold text-sand-900">Reviews</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-sand-500">Loading…</p>
        ) : !reviews?.length ? (
          <p className="text-sm text-sand-500">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-card border border-sand-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${star <= review.rating ? 'fill-brass-500 text-brass-500' : 'text-sand-300'}`}
                        />
                      ))}
                    </div>
                    <Badge variant={review.isApproved ? 'success' : 'neutral'} size="sm">
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-sand-900">{review.productName}</p>
                  {review.title ? <p className="mt-0.5 text-sm text-sand-800">{review.title}</p> : null}
                  {review.body ? <p className="mt-1 text-sm text-sand-600">{review.body}</p> : null}
                  <p className="mt-1.5 text-xs text-sand-500">
                    {review.reviewerName} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setApproval.mutate({ id: review.id, isApproved: !review.isApproved })}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    {review.isApproved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this review?')) deleteReview.mutate(review.id)
                    }}
                    className="text-sand-400 hover:text-danger"
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
