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

/**
 * Requests a resized/compressed render rather than the original — some
 * source photos (real product photography, not the placeholder generator)
 * come in well over 1MB, which is a real Core Web Vitals cost otherwise.
 */
export function productImageUrl(
  storagePath: string | null | undefined,
  options: { width?: number; quality?: number } = {},
) {
  if (!storagePath) return null
  return supabase.storage.from('product-images').getPublicUrl(storagePath, {
    transform: {
      width: options.width ?? 800,
      quality: options.quality ?? 75,
      resize: 'cover',
    },
  }).data.publicUrl
}
