import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Interior design image background with dark overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/categories/interior-hardware-960.jpg')" }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-gradient-to-br from-brand-950/85 via-brand-900/80 to-brand-950/90" />
      <div className="fixed inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-brand-950/40" />

      {/* Subtle warm brass accent light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 size-[24rem] rounded-full bg-brass-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-[20rem] rounded-full bg-brass-400/8 blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_24px_80px_rgb(0_0_0/0.5)]">
            {/* Top accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-brass-500 via-brass-400 to-brand-300" />

            {/* Brand header */}
            <div className="flex flex-col items-center pt-8 pb-6">
              <motion.div
                className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brass-500 to-brand-800 text-white shadow-lg shadow-brass-500/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Crown className="size-7" />
              </motion.div>

              <motion.h1
                className="font-display text-2xl font-extrabold tracking-tight text-white"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Laghara
              </motion.h1>
              <motion.p
                className="mt-1 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-brass-400"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Hardwares · Premium Collection
              </motion.p>

              <motion.div
                className="my-5 h-px w-24 bg-gradient-to-r from-transparent via-brass-400 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.div
                className="text-center"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-xl font-bold text-white">{title}</h2>
                <p className="mt-1.5 text-sm text-white/60">{subtitle}</p>
              </motion.div>
            </div>

            {/* Form body */}
            <div className="space-y-4 px-6 pb-6">{children}</div>
          </div>

          {/* Footer link */}
          <motion.div
            className="mt-5 text-center text-[0.75rem] text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p>© {new Date().getFullYear()} Laghara Hardwares. Crafted with care.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
