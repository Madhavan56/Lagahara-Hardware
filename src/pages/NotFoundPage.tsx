import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-semibold text-brand-800">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-sand-900">Page not found</h1>
      <p className="mt-3 max-w-md text-sand-600">
        The page you are looking for may have moved, or never existed.
      </p>
      <Link to="/" className={`mt-8 ${buttonVariants({ variant: 'primary' })}`}>
        Back to home
      </Link>
    </div>
  )
}
