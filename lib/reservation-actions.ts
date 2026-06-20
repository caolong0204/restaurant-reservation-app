'use server'

import type {
  ActionResult,
  Reservation,
  ReservationEditInput,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
  SlotAvailability,
  OperatingHoursSnapshot,
} from '@/lib/reservation-types'
import { getOperatingHoursSnapshot as getOperatingHoursSnapshotImpl } from '@/lib/operating-hours'
import type { AdminSnapshot } from '@/lib/reservations/types'
import {
  getAdminSnapshot as getAdminSnapshotImpl,
  getAvailableTables as getAvailableTablesImpl,
  getPublicSlotAvailability as getPublicSlotAvailabilityImpl,
} from '@/lib/reservations/queries'
import {
  cancelReservation as cancelReservationMutation,
  confirmReservation as confirmReservationMutation,
  createManualReservation as createManualReservationMutation,
  createReservation as createReservationMutation,
  deleteReservation as deleteReservationMutation,
  editReservation as editReservationMutation,
  updateReservationStatus as updateReservationStatusMutation,
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

export async function getOperatingHoursSnapshot(): Promise<ActionResult<OperatingHoursSnapshot>> {
  return getOperatingHoursSnapshotImpl()
}

export async function createReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  return createReservationMutation(input)
}

export async function createManualReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  return createManualReservationMutation(input)
}

export async function editReservation(id: string, input: ReservationEditInput): Promise<ActionResult<Reservation>> {
  return editReservationMutation(id, input)
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<ActionResult<Reservation>> {
  return updateReservationStatusMutation(id, status)
}

export async function cancelReservation(id: string): Promise<ActionResult<Reservation>> {
  return cancelReservationMutation(id)
}

export async function deleteReservation(id: string): Promise<ActionResult<string>> {
  return deleteReservationMutation(id)
}

export async function confirmReservation(
  id: string,
  tableId: string,
  secondaryTableIds: string[] = [],
  manualArrangement = false,
): Promise<ActionResult<Reservation>> {
  return confirmReservationMutation(id, tableId, secondaryTableIds, manualArrangement)
}
