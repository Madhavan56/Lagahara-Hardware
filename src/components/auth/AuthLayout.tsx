import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

const BRAND_GOLD = 'from-brass-500/20 via-brass-400/10 to-brand-800/10'

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Decorative background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-brass-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-brand-800/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] rounded-full bg-brass-500/[0.02] blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-sand-200 bg-sand-50/80 backdrop-blur-xl shadow-[0_8px_40px_rgb(31_27_23/0.08)]">
          {/* Top accent bar */}
          <div className="h-[3px] bg-gradient-to-r from-brass-500 via-brass-400 to-brand-800" />

          {/* Brand header */}
          <div className="flex flex-col items-center pt-8 pb-6">
            <motion.div
              className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brass-500 to-brand-800 text-white shadow-lg shadow-brass-500/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Crown className="size-7" />
            </motion.div>

            <motion.h1
              className="font-display text-2xl font-extrabold tracking-tight text-brand-900"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Laghara
            </motion.h1>
            <motion.p
              className="mt-1 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-brass-600"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Hardwares · Premium Collection
            </motion.p>

            <motion.div
              className="my-5 h-px w-24 bg-gradient-to-r from-transparent via-brass-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.div
              className="text-center"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-xl font-bold text-sand-900">{title}</h2>
              <p className="mt-1.5 text-sm text-sand-500">{subtitle}</p>
            </motion.div>
          </div>

          {/* Form body */}
          <div className="space-y-4 px-6 pb-6">{children}</div>
        </div>

        {/* Footer link */}
        <motion.div
          className="mt-5 text-center text-[0.75rem] text-sand-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>
            © {new Date().getFullYear()} Laghara Hardwares. Crafted with care.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
