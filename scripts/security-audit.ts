/**
 * Phase 11 security audit: a comprehensive RLS matrix across every table,
 * probed as anon / customer A / customer B / admin. Prints PASS/FAIL for
 * each check and exits non-zero if anything fails.
 *
 * Run with: npm run audit:security
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'
import { supabaseAdmin } from './lib/admin-client'
import { serverEnv } from './lib/env'

const PASSWORD = 'Test-password-123!'

function anonClient() {
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!key) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY missing')
  return createClient<Database>(serverEnv.SUPABASE_URL, key)
}

let failures = 0
let passes = 0
function check(label: string, condition: boolean) {
  if (condition) {
    passes++
    console.log(`  PASS — ${label}`)
  } else {
    failures++
    console.log(`  FAIL — ${label}`)
  }
}

async function createConfirmedUser(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  })
  if (error) throw error
  return data.user!
}

async function signIn(email: string) {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return client
}

async function main() {
  const stamp = Date.now()
  const emailA = `audit-a-${stamp}@example.com`
  const emailB = `audit-b-${stamp}@example.com`
  const emailAdmin = `audit-admin-${stamp}@example.com`

  console.log('Setting up test fixtures…')
  const userA = await createConfirmedUser(emailA)
  const userB = await createConfirmedUser(emailB)
  const userAdmin = await createConfirmedUser(emailAdmin)
  await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', userAdmin.id)

  const clientA = await signIn(emailA)
  const clientB = await signIn(emailB)
  const clientAdmin = await signIn(emailAdmin)
  const clientAnon = anonClient()

  const { data: category } = await supabaseAdmin
    .from('categories')
    .insert({ slug: `audit-cat-${stamp}`, name: 'Audit Category' })
    .select('id')
    .single()
  const { data: product } = await supabaseAdmin
    .from('products')
    .insert({
      category_id: category!.id,
      slug: `audit-prod-${stamp}`,
      sku: `AUDIT-${stamp}`,
      name: 'Audit Product',
      price: 500,
      stock_quantity: 10,
    })
    .select('id')
    .single()

  const { data: addressA } = await supabaseAdmin
    .from('addresses')
    .insert({
      user_id: userA.id,
      full_name: 'Audit A',
      phone: '9999999999',
      line1: '1 Audit St',
      city: 'Chennai',
      state: 'TN',
      postal_code: '600001',
    })
    .select('id')
    .single()

  const { data: orderA } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userA.id,
      status: 'pending',
      subtotal: 500,
      total: 500,
      shipping_method_code: 'standard',
      shipping_method_name: 'Standard',
      shipping_eta_days_min: 4,
      shipping_eta_days_max: 6,
      shipping_address: { full_name: 'Audit A' },
    })
    .select('id')
    .single()
  await supabaseAdmin.from('order_items').insert({
    order_id: orderA!.id,
    product_id: product!.id,
    product_name: 'Audit Product',
    product_slug: `audit-prod-${stamp}`,
    product_sku: `AUDIT-${stamp}`,
    unit_price: 500,
    quantity: 1,
    line_total: 500,
  })

  console.log('\n=== cart_items ===')
  await clientA.from('cart_items').insert({ user_id: userA.id, product_id: product!.id, quantity: 1 })
  const { data: cartOwn } = await clientA.from('cart_items').select('id').eq('user_id', userA.id)
  check('customer A reads own cart', (cartOwn?.length ?? 0) === 1)
  const { data: cartCross } = await clientB.from('cart_items').select('id').eq('user_id', userA.id)
  check('customer B cannot read customer A cart', (cartCross?.length ?? 0) === 0)
  const { data: cartAnon } = await clientAnon.from('cart_items').select('id').eq('user_id', userA.id)
  check('anon cannot read cart_items', (cartAnon?.length ?? 0) === 0)

  console.log('\n=== wishlist_items ===')
  await clientA.from('wishlist_items').insert({ user_id: userA.id, product_id: product!.id })
  const { data: wishCross } = await clientB.from('wishlist_items').select('id').eq('user_id', userA.id)
  check('customer B cannot read customer A wishlist', (wishCross?.length ?? 0) === 0)

  console.log('\n=== addresses ===')
  const { data: addrCross } = await clientB.from('addresses').select('id').eq('id', addressA!.id)
  check('customer B cannot read customer A address', (addrCross?.length ?? 0) === 0)
  const { data: addrAnon } = await clientAnon.from('addresses').select('id')
  check('anon cannot list addresses', (addrAnon?.length ?? 0) === 0)

  console.log('\n=== orders / order_items / order_status_events ===')
  const { data: orderCross } = await clientB.from('orders').select('id').eq('id', orderA!.id)
  check('customer B cannot read customer A order', (orderCross?.length ?? 0) === 0)
  const { data: itemsCross } = await clientB.from('order_items').select('id').eq('order_id', orderA!.id)
  check('customer B cannot read customer A order_items', (itemsCross?.length ?? 0) === 0)
  const { data: eventsCross } = await clientB.from('order_status_events').select('id').eq('order_id', orderA!.id)
  check('customer B cannot read customer A order_status_events', (eventsCross?.length ?? 0) === 0)
  const { data: itemsAdmin } = await clientAdmin.from('order_items').select('id').eq('order_id', orderA!.id)
  check('admin CAN read any order_items', (itemsAdmin?.length ?? 0) === 1)
  const { data: ordersAnon } = await clientAnon.from('orders').select('id')
  check('anon cannot list orders', (ordersAnon?.length ?? 0) === 0)

  console.log('\n=== customer cannot directly write orders (edge function only) ===')
  const { error: directInsertErr } = await clientA.from('orders').insert({
    user_id: userA.id,
    status: 'pending',
    subtotal: 1,
    total: 1,
    shipping_method_code: 'standard',
    shipping_method_name: 'Standard',
    shipping_eta_days_min: 1,
    shipping_eta_days_max: 1,
    shipping_address: {},
  })
  check('customer cannot INSERT an order directly (no policy grants it)', directInsertErr !== null)

  console.log('\n=== reviews: only verified purchasers of DELIVERED orders can review ===')
  const { error: reviewNoOrderErr } = await clientB.from('reviews').insert({
    product_id: product!.id,
    user_id: userB.id,
    rating: 5,
  })
  check('customer with no order cannot review', reviewNoOrderErr !== null)

  const { error: reviewPendingErr } = await clientA.from('reviews').insert({
    product_id: product!.id,
    user_id: userA.id,
    rating: 5,
  })
  check('customer with only a PENDING order cannot review', reviewPendingErr !== null)

  await supabaseAdmin.from('orders').update({ status: 'delivered' }).eq('id', orderA!.id)
  const { error: reviewDeliveredErr } = await clientA.from('reviews').insert({
    product_id: product!.id,
    user_id: userA.id,
    rating: 5,
    body: 'Audit review',
  })
  check('customer with a DELIVERED order for this product CAN review', reviewDeliveredErr === null)

  const { data: reviewAnonRead } = await clientAnon
    .from('reviews')
    .select('id')
    .eq('product_id', product!.id)
    .eq('is_approved', true)
  check('anon can read approved reviews', (reviewAnonRead?.length ?? 0) === 1)

  console.log('\n=== profiles: role escalation and cross-user read ===')
  const { data: profileCross } = await clientB.from('profiles').select('id').eq('id', userA.id)
  check('customer B cannot read customer A profile', (profileCross?.length ?? 0) === 0)
  const { error: escalateErr } = await clientB.from('profiles').update({ role: 'admin' }).eq('id', userB.id)
  check('customer cannot self-promote to admin', escalateErr !== null)

  console.log('\n=== admin-only write tables reject customer writes ===')
  const { data: catBefore } = await supabaseAdmin.from('categories').select('name').eq('id', category!.id).single()
  await clientB.from('categories').update({ name: 'Hacked' }).eq('id', category!.id)
  const { data: catAfter } = await supabaseAdmin.from('categories').select('name').eq('id', category!.id).single()
  check('customer write to categories has no effect', catAfter?.name === catBefore?.name)

  const { data: shipBefore } = await supabaseAdmin.from('shipping_methods').select('price').eq('code', 'standard').single()
  await clientB.from('shipping_methods').update({ price: 1 }).eq('code', 'standard')
  const { data: shipAfter } = await supabaseAdmin.from('shipping_methods').select('price').eq('code', 'standard').single()
  check('customer write to shipping_methods has no effect', shipAfter?.price === shipBefore?.price)

  console.log('\n=== storage: product-images bucket ===')
  const tinyPng = Uint8Array.from(
    atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
    (c) => c.charCodeAt(0),
  )
  const { error: customerUploadErr } = await clientB.storage
    .from('product-images')
    .upload(`audit/${stamp}.png`, tinyPng, { contentType: 'image/png' })
  check('customer cannot upload to product-images', customerUploadErr !== null)

  console.log(`\n${passes} passed, ${failures} failed.`)

  console.log('\nCleaning up…')
  await supabaseAdmin.from('orders').delete().eq('id', orderA!.id)
  await supabaseAdmin.from('products').delete().eq('id', product!.id)
  await supabaseAdmin.from('categories').delete().eq('id', category!.id)
  await supabaseAdmin.auth.admin.deleteUser(userA.id)
  await supabaseAdmin.auth.admin.deleteUser(userB.id)
  await supabaseAdmin.auth.admin.deleteUser(userAdmin.id)

  if (failures > 0) process.exit(1)
}

main().catch((err) => {
  console.error('security-audit crashed:', err)
  process.exit(1)
})
