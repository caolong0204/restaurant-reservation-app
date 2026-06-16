import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { isSupabaseConfigured, getSupabaseEnv } from '@/lib/supabase/config'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // 1. Refresh session
  const response = await updateSession(request)

  // 2. Protect /admin routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    if (!isSupabaseConfigured()) {
      // In demo mode, no protection
      return response
    }

    const { url, publishableKey } = getSupabaseEnv()
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // ignore setAll here, already done in updateSession
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
