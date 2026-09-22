import { supabase } from '@/lib/supabase/client'

export type ContactMessageInput = {
  name: string
  email: string
  phone: string | null
  message: string
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  })
  if (error) throw error
}
