import { supabase } from '@/lib/supabase/client'
import type { Address, AddressInput, Profile } from '@/types/account'

type Row = Record<string, unknown>

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function mapAddress(row: Row): Address {
  return {
    id: asString(row.id),
    label: asNullableString(row.label),
    fullName: asString(row.full_name),
    phone: asString(row.phone),
    line1: asString(row.line1),
    line2: asNullableString(row.line2),
    city: asString(row.city),
    state: asString(row.state),
    postalCode: asString(row.postal_code),
    country: asString(row.country) || 'India',
    isDefault: row.is_default === true,
  }
}

function mapProfile(row: Row): Profile {
  return {
    id: asString(row.id),
    fullName: asNullableString(row.full_name),
    phone: asNullableString(row.phone),
    role: row.role === 'admin' ? 'admin' : 'customer',
  }
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? mapProfile(data) : null
}

export async function updateProfile(userId: string, input: { fullName: string; phone: string }) {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: input.fullName, phone: input.phone })
    .eq('id', userId)

  if (error) throw error
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapAddress)
}

export async function createAddress(userId: string, input: AddressInput, makeDefault: boolean) {
  if (makeDefault) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  }

  const { error } = await supabase.from('addresses').insert({
    user_id: userId,
    label: input.label,
    full_name: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    country: input.country,
    is_default: makeDefault,
  })

  if (error) throw error
}

export async function updateAddress(addressId: string, input: AddressInput) {
  const { error } = await supabase
    .from('addresses')
    .update({
      label: input.label,
      full_name: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      postal_code: input.postalCode,
      country: input.country,
    })
    .eq('id', addressId)

  if (error) throw error
}

export async function deleteAddress(addressId: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', addressId)
  if (error) throw error
}

export async function setDefaultAddress(userId: string, addressId: string) {
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId)
  if (error) throw error
}
