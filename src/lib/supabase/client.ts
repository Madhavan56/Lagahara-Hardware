import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function productImageUrl(storagePath: string | null | undefined) {
  if (!storagePath) return null
  return supabase.storage.from('product-images').getPublicUrl(storagePath).data.publicUrl
}
