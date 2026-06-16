export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      restaurant_tables: {
        Row: {
          id: string
          code: string
          floor: string
          area: string
          capacity: number
          active: boolean
          sort_order: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          floor: string
          area: string
          capacity: number
          active?: boolean
          sort_order?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          floor?: string
          area?: string
          capacity?: number
          active?: boolean
          sort_order?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          reservation_date: string
          reservation_time: string
          party_size: number
          occasion: string | null
          requested_area: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          table_id: string | null
          secondary_table_ids: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_name: string
          guest_email: string
          guest_phone: string
          reservation_date: string
          reservation_time: string
          party_size: number
          occasion?: string | null
          requested_area?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          table_id?: string | null
          secondary_table_ids?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          reservation_date?: string
          reservation_time?: string
          party_size?: number
          occasion?: string | null
          requested_area?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          table_id?: string | null
          secondary_table_ids?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reservations_table_id_fkey'
            columns: ['table_id']
            isOneToOne: false
            referencedRelation: 'restaurant_tables'
            referencedColumns: ['id']
          },
        ]
      }
      staff_profiles: {
        Row: {
          user_id: string
          display_name: string
          role: 'admin' | 'staff'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          role?: 'admin' | 'staff'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          role?: 'admin' | 'staff'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_available_tables: {
        Args: {
          p_date: string
          p_time: string
          p_party_size: number
          p_excluding_reservation_id?: string | null
        }
        Returns: Array<{
          id: string
          code: string
          floor: string
          area: string
          capacity: number
          active: boolean
          sort_order: number
          notes: string | null
        }>
      }
      get_slot_availability: {
        Args: {
          p_date: string
          p_party_size: number
        }
        Returns: Array<{
          time: string
          available_count: number
        }>
      }
      is_active_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
