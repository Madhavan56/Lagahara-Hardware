import { z } from 'zod'

// Only VITE_-prefixed values reach the browser bundle. The service role key is
// deliberately absent here — it belongs to server-side scripts and Edge
// Functions only, and must never be referenced from src/.
const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const parsed = clientEnvSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(
    `Invalid or missing environment variables: ${missing}. ` +
      'Copy .env.example to .env and fill in your Supabase project values.',
  )
}

export const env = parsed.data
