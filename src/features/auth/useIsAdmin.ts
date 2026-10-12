import { useProfile } from '@/features/account/queries'
import { useAuth } from './AuthProvider'

/**
 * UI-only signal for showing admin affordances. Never a security boundary:
 * every admin write is enforced by RLS / storage policies via is_admin().
 */
export function useIsAdmin() {
  const { user, loading } = useAuth()
  const { data: profile, isLoading } = useProfile(user?.id)
  return {
    isAdmin: profile?.role === 'admin',
    loading: loading || (Boolean(user) && isLoading),
    user,
  }
}
