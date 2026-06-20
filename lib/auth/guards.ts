import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/reservation-types'
import { fail, ok } from '@/lib/reservations/shared'

export async function requireStaff(): Promise<ActionResult<true>> {
  const supabase = await createClient()
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub

  if (claimsError || !userId) {
    return fail('Bạn cần đăng nhập để quản lý đặt bàn.')
  }

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('active')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.active) {
    return fail('Tài khoản không có quyền truy cập trang quản trị.')
  }

  return ok(true)
}

export async function requireAdmin(): Promise<ActionResult<true>> {
  const supabase = await createClient()
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub

  if (claimsError || !userId) {
    return fail('Bạn cần đăng nhập để quản lý cài đặt.')
  }

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('active, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.active || data.role !== 'admin') {
    return fail('Chỉ admin mới có quyền quản lý cài đặt.')
  }

  return ok(true)
}
