import type { ActionResult } from '@/lib/reservation-types'

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail<T>(error: string): ActionResult<T> {
  return { ok: false, error }
}

export function dateFromTimestamp(value: string): number {
  return new Date(value).getTime()
}

export function normalizeTime(value: string): string {
  return value.slice(0, 5)
}
