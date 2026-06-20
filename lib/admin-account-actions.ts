'use server'

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'

import { requireAdmin, requireStaff } from '@/lib/auth/guards'
import type { Database } from '@/lib/database.types'
import type { ActionResult, StaffAccount, StaffRole } from '@/lib/reservation-types'
import { fail, ok } from '@/lib/reservations/shared'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type StaffAccountRow = {
  user_id: string
  email: string
  display_name: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

type CreateStaffAccountInput = {
  email: string
  displayName: string
  role: StaffRole
  password: string
}

type UpdateStaffAccountInput = {
  userId: string
  displayName: string
  role: StaffRole
  active: boolean
  password?: string
}

type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

const STAFF_ROLES = new Set<StaffRole>(['admin', 'staff'])

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function validatePassword(password: string) {
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.'
  return null
}

function mapStaffAccount(row: StaffAccountRow): StaffAccount {
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role === 'admin' ? 'admin' : 'staff',
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function getAdminClientOrFail(): ActionResult<SupabaseClient<Database>> {
  try {
    return ok(createAdminClient())
  } catch {
    return fail('Thiếu SUPABASE_SERVICE_ROLE_KEY để tạo hoặc reset mật khẩu tài khoản.')
  }
}

export async function getStaffAccounts(): Promise<ActionResult<StaffAccount[]>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('user_id, email, display_name, role, active, created_at, updated_at')
    .order('display_name', { ascending: true })

  if (error) return fail('Không tải được danh sách tài khoản.')
  return ok((data as StaffAccountRow[]).map(mapStaffAccount))
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<ActionResult<StaffAccount>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const email = normalizeEmail(input.email)
  const displayName = input.displayName.trim()
  if (!email || !email.includes('@')) return fail('Email tài khoản không hợp lệ.')
  if (!displayName) return fail('Vui lòng nhập tên hiển thị.')
  if (!STAFF_ROLES.has(input.role)) return fail('Vai trò không hợp lệ.')
  const passwordError = validatePassword(input.password)
  if (passwordError) return fail(passwordError)

  const adminClient = getAdminClientOrFail()
  if (!adminClient.ok) return fail(adminClient.error)

  const { data: authData, error: authError } = await adminClient.data.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })

  if (authError || !authData.user) {
    return fail(authError?.message ?? 'Không tạo được user Supabase Auth.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_profiles')
    .insert({
      user_id: authData.user.id,
      email,
      display_name: displayName,
      role: input.role,
      active: true,
    })
    .select('user_id, email, display_name, role, active, created_at, updated_at')
    .single()

  if (error) {
    await adminClient.data.auth.admin.deleteUser(authData.user.id)
    if (error.code === '23505') return fail('Email này đã có tài khoản staff.')
    return fail('Không tạo được hồ sơ staff.')
  }

  revalidatePath('/admin')
  return ok(mapStaffAccount(data as StaffAccountRow))
}

export async function updateStaffAccount(
  input: UpdateStaffAccountInput,
): Promise<ActionResult<StaffAccount>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const displayName = input.displayName.trim()
  if (!displayName) return fail('Vui lòng nhập tên hiển thị.')
  if (!STAFF_ROLES.has(input.role)) return fail('Vai trò không hợp lệ.')
  if (input.password) {
    const passwordError = validatePassword(input.password)
    if (passwordError) return fail(passwordError)
  }

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const currentUserId = claims?.claims.sub
  if (currentUserId === input.userId && (!input.active || input.role !== 'admin')) {
    return fail('Không thể tự tắt hoặc hạ quyền admin của chính mình.')
  }

  if (input.password) {
    const adminClient = getAdminClientOrFail()
    if (!adminClient.ok) return fail(adminClient.error)
    const { error } = await adminClient.data.auth.admin.updateUserById(input.userId, {
      password: input.password,
    })
    if (error) return fail(error.message)
  }

  const { data, error } = await supabase
    .from('staff_profiles')
    .update({
      display_name: displayName,
      role: input.role,
      active: input.active,
    })
    .eq('user_id', input.userId)
    .select('user_id, email, display_name, role, active, created_at, updated_at')
    .single()

  if (error) return fail('Không cập nhật được tài khoản.')

  revalidatePath('/admin')
  return ok(mapStaffAccount(data as StaffAccountRow))
}

export async function changeCurrentStaffPassword(
  input: ChangePasswordInput,
): Promise<ActionResult<true>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const currentPassword = input.currentPassword
  const newPassword = input.newPassword
  if (!currentPassword) return fail('Vui lòng nhập mật khẩu hiện tại.')
  const passwordError = validatePassword(newPassword)
  if (passwordError) return fail(passwordError)

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const email = userData.user?.email
  if (userError || !email) return fail('Không xác định được tài khoản hiện tại.')

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (verifyError) return fail('Mật khẩu hiện tại không đúng.')

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return fail(updateError.message)

  return ok(true)
}

export async function deleteStaffAccount(userId: string): Promise<ActionResult<void>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const currentUserId = claims?.claims.sub

  if (currentUserId === userId) {
    return fail('Không thể tự xóa tài khoản của chính mình.')
  }

  // Check if it is the last admin
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (profile?.role === 'admin') {
    const { count } = await supabase
      .from('staff_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('active', true)
      
    if (count && count <= 1) {
      return fail('Không thể xóa admin đang hoạt động cuối cùng.')
    }
  }

  const adminClient = getAdminClientOrFail()
  if (!adminClient.ok) return fail(adminClient.error)

  const { error: deleteAuthError } = await adminClient.data.auth.admin.deleteUser(userId)
  if (deleteAuthError) {
    // Check if it's a foreign key constraint error (e.g. they have reservations)
    if (deleteAuthError.message.includes('foreign key') || deleteAuthError.message.includes('violates foreign key')) {
      return fail('Không thể xóa tài khoản này vì đã có dữ liệu liên quan. Vui lòng tạm khóa tài khoản.')
    }
    return fail('Lỗi khi xóa tài khoản: ' + deleteAuthError.message)
  }

  // Delete profile just in case it doesn't cascade
  await supabase.from('staff_profiles').delete().eq('user_id', userId)

  revalidatePath('/admin')
  return ok(undefined)
}
