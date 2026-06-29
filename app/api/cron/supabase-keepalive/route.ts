import { addDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import type { NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const checkDate = formatInTimeZone(addDays(new Date(), 1), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_slot_availability', {
    p_date: checkDate,
    p_party_size: 2,
  })

  if (error) {
    console.error('Supabase keepalive failed', error)
    return Response.json({ ok: false, error: 'Supabase keepalive failed' }, { status: 502 })
  }

  return Response.json({
    ok: true,
    checkedDate: checkDate,
    slotCount: data.length,
  })
}
