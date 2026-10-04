import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-hero px-4 py-10 sm:px-6">
      {/* Soft violet blooms, matching the hero panel on the homepage. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-24 size-96 rounded-pill bg-iris-200/50 blur-3xl" />
        <div className="absolute -right-24 -bottom-32 size-96 rounded-pill bg-pastel-peach/70 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="overflow-hidden rounded-panel bg-card shadow-float">
          <div className="flex flex-col items-center px-6 pt-8 pb-6">
            <Link to="/" className="flex items-center gap-3" aria-label="Laghara Hardwares home">
              <img
                src="/logo-mark.svg"
                alt=""
                className="size-12 rounded-md object-cover shadow-xs"
              />
              <span className="leading-none">
                <span className="block font-display text-xl font-extrabold tracking-tight text-content">
                  Laghara
                </span>
                <span className="text-label mt-0.5 block text-primary uppercase">Hardwares</span>
              </span>
            </Link>

            <div className="mt-7 text-center">
              <h1 className="text-h2 text-content">{title}</h1>
              <p className="mt-1.5 text-sm text-content-muted">{subtitle}</p>
            </div>
          </div>

          <div className="space-y-4 px-6 pb-7">{children}</div>
        </div>

        <p className="mt-5 text-center text-xs text-content-muted">
          © {new Date().getFullYear()} Laghara Hardwares · Interior & furniture materials
        </p>
      </motion.div>
    </div>
  )
}
