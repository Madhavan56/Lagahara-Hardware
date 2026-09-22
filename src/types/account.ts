export type Address = {
  id: string
  label: string | null
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'>

export type Profile = {
  id: string
  fullName: string | null
  phone: string | null
  role: 'customer' | 'admin'
}
