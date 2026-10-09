import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig, domMax } from 'framer-motion'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { BASE_TRANSITION } from '@/lib/motion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* One motion root for the whole app: reduced-motion handling, the default
            transition, and lazily loaded animation features. */}
        <LazyMotion features={domMax}>
          <MotionConfig reducedMotion="user" transition={BASE_TRANSITION}>
            {children}
          </MotionConfig>
        </LazyMotion>
      </AuthProvider>
    </QueryClientProvider>
  )
}
