'use server'

import type { ActionResult, Reservation, ReservationInput, RestaurantTable, SlotAvailability } from '@/lib/reservation-types'
import type { AdminSnapshot } from '@/lib/reservations/types'
import {
  getAdminSnapshot as getAdminSnapshotImpl,
  getAvailableTables as getAvailableTablesImpl,
  getPublicSlotAvailability as getPublicSlotAvailabilityImpl,
} from '@/lib/reservations/queries'
import {
  cancelReservation as cancelReservationImpl,
  confirmReservation as confirmReservationImpl,
  createManualReservation as createManualReservationImpl,
  createReservation as createReservationImpl,
  deleteReservation as deleteReservationImpl,
  editReservation as editReservationImpl,
} from '@/lib/reservations/mutations'

export async function getAdminSnapshot(): Promise<ActionResult<AdminSnapshot>> {
  return getAdminSnapshotImpl()
}

export async function getAvailableTables(
  date: string,
  time: string,
  partySize: number,
  excludingReservationId?: string,
): Promise<ActionResult<RestaurantTable[]>> {
  return getAvailableTablesImpl(date, time, partySize, excludingReservationId)
}

export async function getPublicSlotAvailability(
  date: string,
  partySize: number,
): Promise<ActionResult<SlotAvailability[]>> {
  return getPublicSlotAvailabilityImpl(date, partySize)
}

export async function createReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  return createReservationImpl(input)
}

export async function createManualReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  return createManualReservationImpl(input)
}

export async function editReservation(id: string, input: ReservationInput): Promise<ActionResult<Reservation>> {
  return editReservationImpl(id, input)
}

export async function cancelReservation(id: string): Promise<ActionResult<Reservation>> {
  return cancelReservationImpl(id)
}

export async function deleteReservation(id: string): Promise<ActionResult<string>> {
  return deleteReservationImpl(id)
}

export async function confirmReservation(
  id: string,
  tableId: string,
  secondaryTableIds: string[] = [],
  manualArrangement = false,
): Promise<ActionResult<Reservation>> {
  return confirmReservationImpl(id, tableId, secondaryTableIds, manualArrangement)
}
