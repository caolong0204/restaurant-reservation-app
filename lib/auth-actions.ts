'use server'

import { redirect } from 'next/navigation'

import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export async function signInAdmin(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/admin')
  }

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/admin/login?error=missing')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/admin/login?error=invalid')
  }

  const { data } = await supabase
    .from('staff_profiles')
    .select('active')
    .eq('user_id', (await supabase.auth.getClaims()).data?.claims.sub ?? '')
    .maybeSingle()

  if (!data?.active) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  redirect('/admin')
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect('/admin/login')
}
