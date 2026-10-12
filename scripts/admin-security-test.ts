/**
 * Admin v2 security + behaviour test, run against the linked project with
 * throwaway users and fixtures (all removed at the end, even on failure).
 * Probes the API directly as anon / customer / admin, the same way an
 * attacker with the public publishable key could.
 *
 * Run with: npm run test:admin-security
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'
import { supabaseAdmin as service } from './lib/admin-client'
import { serverEnv } from './lib/env'

type Client = SupabaseClient<Database>

const PASSWORD = 'Test-password-123!'
const BUCKET = 'product-images'
// 1x1 transparent PNG
const TINY_PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0),
)

function anonClient(): Client {
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!key) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY missing')
  return createClient<Database>(serverEnv.SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

let passes = 0
let failures = 0
function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passes++
    console.log(`  PASS  ${label}`)
  } else {
    failures++
    console.log(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`)
  }
}

async function createUser(email: string) {
  const { data, error } = await service.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true })
  if (error) throw error
  return data.user
}

async function signIn(email: string): Promise<Client> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return client
}

async function stockOf(productId: string) {
  const { data } = await service.from('products').select('stock_quantity').eq('id', productId).single()
  return data?.stock_quantity
}

async function main() {
  const stamp = Date.now()
  const customerEmail = `adm-test-customer-${stamp}@example.com`
  const adminEmail = `adm-test-admin-${stamp}@example.com`
  const cleanup: (() => PromiseLike<unknown>)[] = []

  try {
    console.log('Setting up fixtures…')
    const customer = await createUser(customerEmail)
    cleanup.push(() => service.auth.admin.deleteUser(customer.id))
    const admin = await createUser(adminEmail)
    // Demote before deleting so the last-admin guard never matters for cleanup.
    cleanup.push(async () => {
      await service.from('profiles').update({ role: 'customer' }).eq('id', admin.id)
      await service.auth.admin.deleteUser(admin.id)
    })
    // Service role (auth.uid() is null) is the "SQL editor" path for bootstrapping an admin.
    const { error: bootstrapErr } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
    if (bootstrapErr) throw bootstrapErr

    const anon = anonClient()
    const cust = await signIn(customerEmail)
    const adm = await signIn(adminEmail)

    const { data: category, error: catErr } = await service
      .from('categories')
      .insert({ slug: `adm-test-${stamp}`, name: 'Admin Test Category', is_active: true })
      .select('id')
      .single()
    if (catErr) throw catErr
    cleanup.push(() => service.from('categories').delete().eq('id', category.id))

    const { data: product, error: prodErr } = await service
      .from('products')
      .insert({
        category_id: category.id,
        slug: `adm-test-prod-${stamp}`,
        sku: `ADMTEST-${stamp}`,
        name: 'Admin Test Product',
        price: 1000,
        stock_quantity: 10,
      })
      .select('id')
      .single()
    if (prodErr) throw prodErr
    cleanup.push(() => service.from('products').delete().eq('id', product.id))

    const { data: hidden } = await service
      .from('products')
      .insert({
        category_id: category.id,
        slug: `adm-test-hidden-${stamp}`,
        sku: `ADMTEST-H-${stamp}`,
        name: 'Hidden Test Product',
        price: 100,
        is_active: false,
      })
      .select('id')
      .single()
    cleanup.push(() => service.from('products').delete().eq('id', hidden!.id))

    const fixturePath = `adm-test/${stamp}/fixture.png`
    await service.storage.from(BUCKET).upload(fixturePath, TINY_PNG, { contentType: 'image/png' })
    cleanup.push(() => service.storage.from(BUCKET).remove([fixturePath]))
    const { data: fixtureImage } = await service
      .from('product_images')
      .insert({ product_id: product.id, storage_path: fixturePath, is_primary: true, sort_order: 0 })
      .select('id')
      .single()

    // ------------------------------------------------------------- anon
    console.log('\n=== Logged out (anon key only) ===')
    {
      const { data: profiles } = await anon.from('profiles').select('id, role')
      check('cannot read any profiles', (profiles?.length ?? 0) === 0)
      const { data: admins, error } = await anon.rpc('admin_list_admins')
      check('cannot list admins', error !== null || (admins?.length ?? 0) === 0)
      const { error: roleErr } = await anon.rpc('admin_set_user_role', { p_email: customerEmail, p_role: 'admin' })
      check('cannot call admin_set_user_role', roleErr !== null)
      const { error: insErr } = await anon.from('products').insert({
        category_id: category.id, slug: `anon-${stamp}`, sku: `ANON-${stamp}`, name: 'Anon', price: 1,
      })
      check('cannot insert products', insErr !== null)
      const { data: upd } = await anon.from('products').update({ price: 1 }).eq('id', product.id).select('id')
      check('cannot update products', (upd?.length ?? 0) === 0)
      const { data: hiddenRead } = await anon.from('products').select('id').eq('id', hidden!.id)
      check('cannot read hidden products', (hiddenRead?.length ?? 0) === 0)
      const { data: visibleRead } = await anon.from('products').select('id').eq('id', product.id)
      check('can still read active products', (visibleRead?.length ?? 0) === 1)
      const { error: upErr } = await anon.storage.from(BUCKET).upload(`adm-test/${stamp}/anon.png`, TINY_PNG, { contentType: 'image/png' })
      check('cannot upload images', upErr !== null)
      const { data: listing } = await anon.storage.from(BUCKET).list('', { limit: 5 })
      check('cannot list bucket contents', (listing?.length ?? 0) === 0)
      const publicUrl = anon.storage.from(BUCKET).getPublicUrl(fixturePath).data.publicUrl
      const res = await fetch(publicUrl)
      check('public image URLs still load', res.ok, res.status)
    }

    // --------------------------------------------------------- customer
    console.log('\n=== Customer ===')
    {
      const { error: selfRoleErr } = await cust.from('profiles').update({ role: 'admin' }).eq('id', customer.id)
      check('cannot change own role via direct UPDATE', selfRoleErr !== null)
      const { error: rpcErr } = await cust.rpc('admin_set_user_role', { p_email: customerEmail, p_role: 'admin' })
      check('cannot promote self via admin_set_user_role', rpcErr !== null)
      const { data: role } = await service.from('profiles').select('role').eq('id', customer.id).single()
      check('role is still customer', role?.role === 'customer')
      const { error: insertProfileErr } = await cust.from('profiles').insert({ id: customer.id, role: 'admin' })
      check('cannot insert a profile with role admin', insertProfileErr !== null)
      const { data: admins, error: listErr } = await cust.rpc('admin_list_admins')
      check('cannot list admins', listErr !== null || (admins?.length ?? 0) === 0)
      const { data: otherProfiles } = await cust.from('profiles').select('id').neq('id', customer.id)
      check("cannot read other users' profiles", (otherProfiles?.length ?? 0) === 0)

      const { error: insErr } = await cust.from('products').insert({
        category_id: category.id, slug: `cust-${stamp}`, sku: `CUST-${stamp}`, name: 'Cust', price: 1,
      })
      check('cannot insert products', insErr !== null)
      const { data: upd } = await cust.from('products').update({ stock_quantity: 9999 }).eq('id', product.id).select('id')
      check('cannot change stock', (upd?.length ?? 0) === 0 && (await stockOf(product.id)) === 10)
      const { data: del } = await cust.from('products').delete().eq('id', product.id).select('id')
      check('cannot delete products', (del?.length ?? 0) === 0)
      const { data: hiddenRead } = await cust.from('products').select('id').eq('id', hidden!.id)
      check('cannot read hidden products', (hiddenRead?.length ?? 0) === 0)

      const { error: imgRowErr } = await cust.from('product_images').insert({ product_id: product.id, storage_path: 'x/y.png' })
      check('cannot insert product_images rows', imgRowErr !== null)
      const { error: primaryErr } = await cust.rpc('admin_set_primary_image', { p_image_id: fixtureImage!.id })
      check('cannot call admin_set_primary_image', primaryErr !== null)
      const { error: reorderErr } = await cust.rpc('admin_reorder_product_images', { p_product_id: product.id, p_image_ids: [fixtureImage!.id] })
      check('cannot call admin_reorder_product_images', reorderErr !== null)
      const { error: upErr } = await cust.storage.from(BUCKET).upload(`adm-test/${stamp}/cust.png`, TINY_PNG, { contentType: 'image/png' })
      check('cannot upload images', upErr !== null)
      const { error: overwriteErr } = await cust.storage.from(BUCKET).upload(fixturePath, TINY_PNG, { contentType: 'image/png', upsert: true })
      check('cannot overwrite an existing image', overwriteErr !== null)
      await cust.storage.from(BUCKET).remove([fixturePath])
      const { data: stillThere } = await service.storage.from(BUCKET).list(`adm-test/${stamp}`)
      check('cannot delete images', (stillThere ?? []).some((f) => f.name === 'fixture.png'))
      const { data: catUpd } = await cust.from('categories').update({ image_path: 'evil.png' }).eq('id', category.id).select('id')
      check('cannot change category images', (catUpd?.length ?? 0) === 0)
    }

    // ------------------------------------------------------------ admin
    console.log('\n=== Admin ===')
    {
      const { data: admins, error: listErr } = await adm.rpc('admin_list_admins')
      check('can list admins (incl. emails)', !listErr && (admins ?? []).some((a) => a.email === adminEmail), listErr)

      const { error: promoteErr } = await adm.rpc('admin_set_user_role', { p_email: customerEmail.toUpperCase(), p_role: 'admin' })
      const { data: promoted } = await service.from('profiles').select('role').eq('id', customer.id).single()
      check('can promote a user by email (case-insensitive)', !promoteErr && promoted?.role === 'admin', promoteErr)
      const { error: demoteErr } = await adm.rpc('admin_set_user_role', { p_email: customerEmail, p_role: 'customer' })
      const { data: demoted } = await service.from('profiles').select('role').eq('id', customer.id).single()
      check('can demote an admin', !demoteErr && demoted?.role === 'customer', demoteErr)
      const { error: unknownErr } = await adm.rpc('admin_set_user_role', { p_email: `nobody-${stamp}@example.com`, p_role: 'admin' })
      check('unknown email is rejected', unknownErr !== null)

      const { data: created, error: createErr } = await adm
        .from('products')
        .insert({ category_id: category.id, slug: `adm-new-${stamp}`, sku: `ADMNEW-${stamp}`, name: 'Admin Created', price: 50 })
        .select('id')
        .single()
      check('can create products', !createErr && Boolean(created), createErr)
      if (created) cleanup.push(() => service.from('products').delete().eq('id', created.id))

      const { error: compareErr } = await adm.from('products').update({ compare_at_price: 500 }).eq('id', product.id)
      check('DB rejects old price <= price', compareErr !== null)
      const { error: slugErr } = await adm.from('products').update({ slug: 'Bad Slug!' }).eq('id', product.id)
      check('DB rejects malformed slug', slugErr !== null)
      const { error: sheetErr } = await adm.from('products').update({ is_sheet_product: true }).eq('id', product.id)
      check('DB rejects sheet product without dimensions', sheetErr !== null)
      const { error: negStockErr } = await adm.from('products').update({ stock_quantity: -1 }).eq('id', product.id)
      check('DB rejects negative stock', negStockErr !== null)
      const { error: sheetOkErr } = await adm
        .from('products')
        .update({ is_sheet_product: true, sheet_length_ft: 8, sheet_width_ft: 4, wastage_percent: 12 })
        .eq('id', product.id)
      check('can set sheet product with dimensions', !sheetOkErr, sheetOkErr)

      const { error: hideErr } = await adm.from('products').update({ is_active: false }).eq('id', product.id)
      const { data: hiddenNow } = await anon.from('products').select('id').eq('id', product.id)
      check('soft delete (hide) removes it from the storefront', !hideErr && (hiddenNow?.length ?? 0) === 0)
      await adm.from('products').update({ is_active: true }).eq('id', product.id)

      const adminPath = `adm-test/${stamp}/admin.png`
      const { error: admUpErr } = await adm.storage.from(BUCKET).upload(adminPath, TINY_PNG, { contentType: 'image/png' })
      check('can upload images', !admUpErr, admUpErr)
      cleanup.push(() => service.storage.from(BUCKET).remove([adminPath]))
      const { data: second, error: rowErr } = await adm
        .from('product_images')
        .insert({ product_id: product.id, storage_path: adminPath, sort_order: 1, alt_text: 'Test' })
        .select('id')
        .single()
      check('can add image rows', !rowErr, rowErr)
      const { error: setPrimaryErr } = await adm.rpc('admin_set_primary_image', { p_image_id: second!.id })
      const { data: primaries } = await service.from('product_images').select('id').eq('product_id', product.id).eq('is_primary', true)
      check('set primary leaves exactly one primary', !setPrimaryErr && primaries?.length === 1 && primaries[0]?.id === second!.id)
      const { error: reorderErr } = await adm.rpc('admin_reorder_product_images', {
        p_product_id: product.id,
        p_image_ids: [second!.id, fixtureImage!.id],
      })
      const { data: ordered } = await service.from('product_images').select('id').eq('product_id', product.id).order('sort_order')
      check('reorder applies the given order', !reorderErr && ordered?.[0]?.id === second!.id)
      const { error: admRemoveErr } = await adm.storage.from(BUCKET).remove([adminPath])
      check('can delete images', !admRemoveErr, admRemoveErr)
      const { data: catImg } = await adm.from('categories').update({ image_path: `categories/adm-test-${stamp}/x.webp` }).eq('id', category.id).select('id')
      check('can set category images', (catImg?.length ?? 0) === 1)
    }

    // ------------------------------------------------- stock + delete guard
    console.log('\n=== Stock commitment & delete guard ===')
    {
      const { data: order } = await service
        .from('orders')
        .insert({
          user_id: customer.id, status: 'pending', subtotal: 3000, total: 3000,
          shipping_method_code: 'standard', shipping_method_name: 'Standard',
          shipping_eta_days_min: 4, shipping_eta_days_max: 6, shipping_address: { full_name: 'Test' },
        })
        .select('id')
        .single()
      cleanup.push(() => service.from('orders').delete().eq('id', order!.id))
      await service.from('order_items').insert({
        order_id: order!.id, product_id: product.id, product_name: 'Admin Test Product',
        product_slug: `adm-test-prod-${stamp}`, product_sku: `ADMTEST-${stamp}`,
        unit_price: 1000, quantity: 3, line_total: 3000,
      })

      check('pending order does not touch stock', (await stockOf(product.id)) === 10)
      await service.from('orders').update({ status: 'confirmed' }).eq('id', order!.id)
      check('confirming the order reduces stock 10 → 7', (await stockOf(product.id)) === 7)
      await service.from('orders').update({ status: 'processing' }).eq('id', order!.id)
      check('later status changes do not reduce again', (await stockOf(product.id)) === 7)
      await service.from('orders').update({ status: 'cancelled' }).eq('id', order!.id)
      check('cancelling restores stock to 10', (await stockOf(product.id)) === 10)

      const { error: delErr } = await adm.from('products').delete().eq('id', product.id)
      check('hard delete is refused when the product has orders', delErr !== null && (await stockOf(product.id)) === 10, delErr?.code)

      const { data: big } = await service
        .from('orders')
        .insert({
          user_id: customer.id, status: 'pending', subtotal: 20000, total: 20000,
          shipping_method_code: 'standard', shipping_method_name: 'Standard',
          shipping_eta_days_min: 4, shipping_eta_days_max: 6, shipping_address: { full_name: 'Test' },
        })
        .select('id')
        .single()
      cleanup.push(() => service.from('orders').delete().eq('id', big!.id))
      await service.from('order_items').insert({
        order_id: big!.id, product_id: product.id, product_name: 'Admin Test Product',
        product_slug: `adm-test-prod-${stamp}`, product_sku: `ADMTEST-${stamp}`,
        unit_price: 1000, quantity: 20, line_total: 20000,
      })
      const { error: oversellErr } = await service.from('orders').update({ status: 'confirmed' }).eq('id', big!.id)
      const { data: bigAfter } = await service.from('orders').select('status').eq('id', big!.id).single()
      check('oversell is refused (order stays pending, stock unchanged)', oversellErr !== null && bigAfter?.status === 'pending' && (await stockOf(product.id)) === 10)
    }
  } finally {
    console.log(`\n${passes} passed, ${failures} failed.`)
    console.log('Cleaning up…')
    for (const step of cleanup.reverse()) {
      try {
        await step()
      } catch (err) {
        console.error('  cleanup step failed:', err)
      }
    }
  }

  if (failures > 0) process.exit(1)
}

main().catch((err) => {
  console.error('admin-security-test crashed:', err)
  process.exit(1)
})
