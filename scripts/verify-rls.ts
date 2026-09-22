/**
 * Negative-test RLS: creates two confirmed users, has user A create an
 * address, and confirms user B cannot read it (or user A's profile row)
 * while user A can read their own. Cleans up afterward.
 *
 * Run with: npm run verify:rls
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'
import { supabaseAdmin } from './lib/admin-client'
import { serverEnv } from './lib/env'

function anonClient() {
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!publishableKey) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY missing from .env')
  return createClient<Database>(serverEnv.SUPABASE_URL, publishableKey)
}

async function createConfirmedUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  return data.user
}

async function main() {
  const stamp = Date.now()
  const emailA = `rls-test-a-${stamp}@example.com`
  const emailB = `rls-test-b-${stamp}@example.com`
  const password = 'Test-password-123!'

  console.log('Creating two confirmed test users…')
  const userA = await createConfirmedUser(emailA, password)
  const userB = await createConfirmedUser(emailB, password)
  if (!userA || !userB) throw new Error('User creation failed')

  const clientA = anonClient()
  const clientB = anonClient()

  const { error: signInAError } = await clientA.auth.signInWithPassword({ email: emailA, password })
  if (signInAError) throw signInAError
  const { error: signInBError } = await clientB.auth.signInWithPassword({ email: emailB, password })
  if (signInBError) throw signInBError

  console.log('Creating an address as user A…')
  const { data: address, error: insertError } = await clientA
    .from('addresses')
    .insert({
      user_id: userA.id,
      full_name: 'RLS Test',
      phone: '9999999999',
      line1: '1 Test Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '600001',
    })
    .select('id')
    .single()
  if (insertError) throw insertError

  let failures = 0

  console.log('User A reading own address…')
  const { data: ownRead } = await clientA.from('addresses').select('id').eq('id', address.id)
  if (ownRead?.length === 1) {
    console.log('  PASS — user A can read their own address')
  } else {
    console.log('  FAIL — user A could not read their own address')
    failures++
  }

  console.log('User B reading user A\'s address (should be blocked)…')
  const { data: crossRead } = await clientB.from('addresses').select('id').eq('id', address.id)
  if (!crossRead || crossRead.length === 0) {
    console.log('  PASS — user B cannot read user A\'s address')
  } else {
    console.log('  FAIL — user B read user A\'s address:', crossRead)
    failures++
  }

  console.log('User B reading user A\'s profile row (should be blocked)…')
  const { data: profileRead } = await clientB.from('profiles').select('id').eq('id', userA.id)
  if (!profileRead || profileRead.length === 0) {
    console.log('  PASS — user B cannot read user A\'s profile')
  } else {
    console.log('  FAIL — user B read user A\'s profile:', profileRead)
    failures++
  }

  console.log('User B attempting to self-promote to admin (should be blocked)…')
  const { error: escalateError } = await clientB.from('profiles').update({ role: 'admin' }).eq('id', userB.id)
  if (escalateError) {
    console.log('  PASS — role escalation rejected:', escalateError.message)
  } else {
    console.log('  FAIL — user B was able to set role=admin on themselves')
    failures++
  }

  console.log('\nCleaning up test users…')
  await supabaseAdmin.auth.admin.deleteUser(userA.id)
  await supabaseAdmin.auth.admin.deleteUser(userB.id)

  if (failures > 0) {
    console.error(`\n${failures} RLS check(s) FAILED`)
    process.exit(1)
  }
  console.log('\nAll RLS checks passed.')
}

main().catch((err) => {
  console.error('verify-rls failed:', err)
  process.exit(1)
})
