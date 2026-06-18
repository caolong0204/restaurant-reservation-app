import type { Database } from '@/lib/database.types'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'

export type ReservationRow = Database['public']['Tables']['reservations']['Row']
export type RestaurantTableRow = Database['public']['Tables']['restaurant_tables']['Row']

export type AdminSnapshot = {
  reservations: Reservation[]
  tables: RestaurantTable[]
}
