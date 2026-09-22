import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'
import { serverEnv } from './env'

// Service role key — bypasses RLS. Server-side scripts only, never imported
// from src/ or shipped to the browser.
export const supabaseAdmin = createClient<Database>(
  serverEnv.SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
)
