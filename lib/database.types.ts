export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      reservation_table_assignments: {
        Row: {
          created_at: string
          id: string
          reservation_date: string
          reservation_id: string
          role: string
          service_window: unknown
          table_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reservation_date: string
          reservation_id: string
          role: string
          service_window: unknown
          table_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reservation_date?: string
          reservation_id?: string
          role?: string
          service_window?: unknown
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_table_assignments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_table_assignments_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          completed_at: string | null
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string
          id: string
          locale: string
          manual_arrangement: boolean
          notes: string | null
          occasion: string | null
          party_size: number
          requested_area: string | null
          reservation_date: string
          reservation_time: string
          secondary_table_ids: string | null
          service_window: unknown
          status: string
          table_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone: string
          id?: string
          locale?: string
          manual_arrangement?: boolean
          notes?: string | null
          occasion?: string | null
          party_size: number
          requested_area?: string | null
          reservation_date: string
          reservation_time: string
          secondary_table_ids?: string | null
          service_window?: unknown
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string
          id?: string
          locale?: string
          manual_arrangement?: boolean
          notes?: string | null
          occasion?: string | null
          party_size?: number
          requested_area?: string | null
          reservation_date?: string
          reservation_time?: string
          secondary_table_ids?: string | null
          service_window?: unknown
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_display_settings: {
        Row: {
          created_at: string
          id: number
          show_closed_days_in_footer: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          show_closed_days_in_footer?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          show_closed_days_in_footer?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          active: boolean
          area: string
          availability_status: string
          capacity: number
          code: string
          created_at: string
          floor: string
          id: string
          notes: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          area: string
          availability_status?: string
          capacity: number
          code: string
          created_at?: string
          floor: string
          id?: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          area?: string
          availability_status?: string
          capacity?: number
          code?: string
          created_at?: string
          floor?: string
          id?: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_weekly_hours: {
        Row: {
          close_time: string
          created_at: string
          is_open: boolean
          last_booking_time: string
          open_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          close_time?: string
          created_at?: string
          is_open?: boolean
          last_booking_time?: string
          open_time?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          close_time?: string
          created_at?: string
          is_open?: boolean
          last_booking_time?: string
          open_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          email: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          email: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          email?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_tables: {
        Args: {
          p_date: string
          p_excluding_reservation_id?: string
          p_party_size: number
          p_time: string
        }
        Returns: {
          active: boolean
          area: string
          capacity: number
          code: string
          floor: string
          id: string
          notes: string
          sort_order: number
        }[]
      }
      get_booking_duration_minutes: {
        Args: { p_party_size: number }
        Returns: number
      }
      get_last_booking_time: { Args: { p_date: string }; Returns: string }
      get_slot_availability: {
        Args: { p_date: string; p_party_size: number }
        Returns: {
          available_count: number
          time: string
        }[]
      }
      is_active_admin: { Args: never; Returns: boolean }
      is_active_staff: { Args: never; Returns: boolean }
      is_valid_reservation_slot: {
        Args: { p_date: string; p_party_size: number; p_time: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
