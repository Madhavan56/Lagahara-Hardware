import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { summarizeRatings, type ProductReviewEligibility } from '@/features/catalog/api'
import { useSubmitProductReview } from '@/features/catalog/queries'
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

export function ReviewsSection({
  productId,
  reviews,
  isLoading,
  eligibility,
  eligibilityLoading = false,
}: {
  productId: string
  reviews: Review[] | undefined
  isLoading?: boolean
  eligibility?: ProductReviewEligibility
  eligibilityLoading?: boolean
}) {
  const { user } = useAuth()
  const submitReview = useSubmitProductReview(productId)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [formMessage, setFormMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormMessage(null)

    try {
      await submitReview.mutateAsync({ rating, title, body })
      setTitle('')
      setBody('')
      setFormMessage('Thanks. Your review has been submitted.')
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Only verified buyers can review this product.')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-sand-500">Loading reviews…</p>
  }

  const summary = summarizeRatings(reviews ?? [])

  return (
    <div>
      <div className="mb-8 rounded-card border border-sand-200 bg-sand-50 p-5">
        <h3 className="text-base font-bold text-sand-900">Share your experience</h3>
        {!user ? (
          <p className="mt-2 text-sm text-sand-600">
            <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="font-semibold text-brand-700 hover:text-brand-900">
              Sign in
            </Link>{' '}
            to review after your delivered order.
          </p>
        ) : eligibilityLoading ? (
          <p className="mt-2 text-sm text-sand-600">Checking your purchase history…</p>
        ) : eligibility?.hasReviewed ? (
          <p className="mt-2 text-sm font-medium text-brand-800" role="status">
            You already reviewed this product.
          </p>
        ) : !eligibility?.hasPurchased || !eligibility.isDelivered ? (
          <p className="mt-2 text-sm text-sand-600">
            You can review this product after your order has been delivered.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <p className="mb-1.5 text-sm font-medium text-sand-700">Your rating</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 hover:bg-sand-200"
                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                    aria-pressed={rating === value}
                  >
                    <Star className={`size-5 ${value <= rating ? 'fill-brass-500 text-brass-500' : 'text-sand-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Review title (optional)"
              maxLength={120}
              className="h-10 w-full rounded-lg border border-sand-300 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What did you think?"
              maxLength={1000}
              rows={3}
              className="w-full resize-y rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />
            <button type="submit" disabled={submitReview.isPending} className="rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {submitReview.isPending ? 'Submitting…' : 'Submit review'}
            </button>
            {formMessage ? <p className="text-sm text-sand-600" role="status">{formMessage}</p> : null}
          </form>
        )}
      </div>

      {!reviews?.length ? (
        <div className="rounded-card border border-sand-200 bg-sand-50 p-6 text-center">
          <p className="text-sm text-sand-600">No reviews yet. Be the first to review this product.</p>
        </div>
      ) : null}

      {reviews?.length ? (
        <>
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
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-sand-500">
              <span>— {review.authorName ?? 'Verified Buyer'}</span>
              <span className="rounded-full bg-add-50 px-2 py-0.5 text-[0.6875rem] font-bold text-add-600">
                Verified purchase
              </span>
            </p>
          </li>
        ))}
      </ul>
        </>
      ) : null}
    </div>
  )
}
