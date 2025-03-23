export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          attendees: number | null
          created_at: string | null
          end_date: string
          facility_id: string | null
          id: string
          notes: string | null
          purpose: string | null
          start_date: string
          status: string
          user_avatar: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          attendees?: number | null
          created_at?: string | null
          end_date: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          start_date: string
          status: string
          user_avatar?: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Update: {
          attendees?: number | null
          created_at?: string | null
          end_date?: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          start_date?: string
          status?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          available_for: string[] | null
          capacity: number | null
          created_at: string | null
          department: string | null
          description: string | null
          features: string[] | null
          id: string
          image: string | null
          location: string | null
          name: string
          open_hours: string | null
          requires_approval: boolean | null
          status: string
          type: string
        }
        Insert: {
          available_for?: string[] | null
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          location?: string | null
          name: string
          open_hours?: string | null
          requires_approval?: boolean | null
          status: string
          type: string
        }
        Update: {
          available_for?: string[] | null
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          location?: string | null
          name?: string
          open_hours?: string | null
          requires_approval?: boolean | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          location: string
          name: string
          quantity: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          location: string
          name: string
          quantity?: number
          status: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          faculty: string | null
          id: string
          name: string
          university: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string
          description?: string | null
          faculty?: string | null
          id?: string
          name: string
          university?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          faculty?: string | null
          id?: string
          name?: string
          university?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          id: string
          name: string
          price: number
          purchase_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          name: string
          price: number
          purchase_id?: string | null
          quantity: number
        }
        Update: {
          id?: string
          name?: string
          price?: number
          purchase_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by_id: string | null
          approved_by_name: string | null
          created_at: string | null
          department: string
          id: string
          notes: string | null
          priority: string
          rejection_reason: string | null
          requested_by_avatar: string | null
          requested_by_id: string
          requested_by_name: string
          requested_by_role: string
          status: string
          title: string
          total_amount: number
        }
        Insert: {
          approved_at?: string | null
          approved_by_id?: string | null
          approved_by_name?: string | null
          created_at?: string | null
          department: string
          id: string
          notes?: string | null
          priority: string
          rejection_reason?: string | null
          requested_by_avatar?: string | null
          requested_by_id: string
          requested_by_name: string
          requested_by_role: string
          status: string
          title: string
          total_amount: number
        }
        Update: {
          approved_at?: string | null
          approved_by_id?: string | null
          approved_by_name?: string | null
          created_at?: string | null
          department?: string
          id?: string
          notes?: string | null
          priority?: string
          rejection_reason?: string | null
          requested_by_avatar?: string | null
          requested_by_id?: string
          requested_by_name?: string
          requested_by_role?: string
          status?: string
          title?: string
          total_amount?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          last_active: string | null
          name: string
          organization_id: string | null
          role: string
          status: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id: string
          last_active?: string | null
          name: string
          organization_id?: string | null
          role: string
          status?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_active?: string | null
          name?: string
          organization_id?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_purchase_items: {
        Args: {
          purchase_id: string
        }
        Returns: {
          id: string
          name: string
          quantity: number
          price: number
          total: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
