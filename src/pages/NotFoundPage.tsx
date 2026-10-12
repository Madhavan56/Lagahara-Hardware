import { m, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { IslandIcon } from '@/components/ui/island-icon'
import { PageTitle } from '@/components/motion/page-title'

export default function NotFoundPage() {
  const reduce = useReducedMotion()
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      {/* Each digit drops in on a spring, then the group floats. */}
      <p aria-hidden className="flex animate-bob font-display text-7xl font-extrabold sm:text-8xl">
        {['4', '0', '4'].map((digit, i) => (
          <m.span
            key={i}
            className="inline-block bg-gradient-brand bg-clip-text text-transparent"
            initial={reduce ? false : { y: -60, opacity: 0, rotate: i === 1 ? 0 : i === 0 ? -12 : 12 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 + i * 0.12 }}
          >
            {digit}
          </m.span>
        ))}
      </p>
      <PageTitle className="mt-4 text-h1 text-content" text="Page not found" accent={false} />
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
