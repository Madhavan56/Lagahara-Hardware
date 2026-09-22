import { Star } from 'lucide-react'
import { summarizeRatings } from '@/features/catalog/api'
import { formatDate } from '@/lib/utils'
import type { Review } from '@/types/catalog'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= Math.round(rating) ? 'fill-brass-500 text-brass-500' : 'text-sand-300'}`}
        />
      ))}
    </div>
  )
}

export function ReviewsSection({ reviews, isLoading }: { reviews: Review[] | undefined; isLoading?: boolean }) {
  if (isLoading) {
    return <p className="text-sm text-sand-500">Loading reviews…</p>
  }

  const summary = summarizeRatings(reviews ?? [])

  if (!reviews?.length) {
    return (
      <div className="rounded-card border border-sand-200 bg-sand-50 p-6 text-center">
        <p className="text-sm text-sand-600">No reviews yet. Be the first to review this product.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="text-center sm:border-r sm:border-sand-200 sm:pr-6">
          <p className="font-display text-4xl font-semibold text-sand-900">{summary.average.toFixed(1)}</p>
          <StarRow rating={summary.average} />
          <p className="mt-1 text-xs text-sand-500">{summary.count} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.histogram[star]
            const pct = summary.count ? Math.round((count / summary.count) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-3">{star}</span>
                <Star className="size-3 fill-brass-500 text-brass-500" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200">
                  <div className="h-full rounded-full bg-brass-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <ul className="space-y-6">
        {reviews.map((review) => (
          <li key={review.id} className="border-t border-sand-200 pt-5 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <StarRow rating={review.rating} />
                {review.title ? (
                  <p className="mt-1.5 text-sm font-medium text-sand-900">{review.title}</p>
                ) : null}
              </div>
              <p className="text-xs whitespace-nowrap text-sand-500">{formatDate(review.createdAt)}</p>
            </div>
            {review.body ? <p className="mt-2 text-sm leading-relaxed text-sand-700">{review.body}</p> : null}
            <p className="mt-2 text-xs font-medium text-sand-500">— {review.authorName ?? 'Verified Buyer'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
