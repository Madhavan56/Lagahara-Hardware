import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { IslandIcon } from '@/components/ui/island-icon'

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-semibold text-iris-800">404</p>
      <h1 className="mt-4 text-h1 text-content">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-600">
        The page you are looking for may have moved, or never existed.
      </p>
      <Link to="/" className={`group mt-8 ${buttonVariants({ variant: 'primary', size: 'lg' })} pr-2`}>
        Back to home
        <IslandIcon />
      </Link>
    </div>
  )
}
