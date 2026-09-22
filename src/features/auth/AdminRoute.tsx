import { Navigate, Outlet } from 'react-router-dom'
import { useProfile } from '@/features/account/queries'
import { useAuth } from './AuthProvider'

export function AdminRoute() {
  const { user, loading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id)

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-sand-300 border-t-brand-700" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
