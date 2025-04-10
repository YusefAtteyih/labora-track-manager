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
          equipment_id: string | null
          facility_id: string | null
          id: string
          lab_id: string | null
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
          equipment_id?: string | null
          facility_id?: string | null
          id?: string
          lab_id?: string | null
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
          equipment_id?: string | null
          facility_id?: string | null
          id?: string
          lab_id?: string | null
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
            foreignKeyName: "bookings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image: string | null
          lab_id: string | null
          last_maintenance: string | null
          maintenance_schedule: string | null
          manufacturer: string | null
          model: string | null
          name: string
          purchase_date: string | null
          quantity: number | null
          status: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          lab_id?: string | null
          last_maintenance?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          purchase_date?: string | null
          quantity?: number | null
          status: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          lab_id?: string | null
          last_maintenance?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          quantity?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          faculty: string | null
          id: string
          name: string
          parent_id: string | null
          university: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string
          description?: string | null
          faculty?: string | null
          id?: string
          name: string
          parent_id?: string | null
          university?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          faculty?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          university?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculties_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          facility_id: string | null
          id: string
          lab_id: string | null
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
          facility_id?: string | null
          id?: string
          lab_id?: string | null
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
          facility_id?: string | null
          id?: string
          lab_id?: string | null
          location?: string
          name?: string
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          available_for: string[] | null
          capacity: number | null
          created_at: string | null
          department: string | null
          description: string | null
          faculty_id: string | null
          features: string[] | null
          id: string
          image: string | null
          location: string | null
          name: string
          open_hours: string | null
          requires_approval: boolean | null
          status: string
        }
        Insert: {
          available_for?: string[] | null
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          faculty_id?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          location?: string | null
          name: string
          open_hours?: string | null
          requires_approval?: boolean | null
          status: string
        }
        Update: {
          available_for?: string[] | null
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          faculty_id?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          location?: string | null
          name?: string
          open_hours?: string | null
          requires_approval?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
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
          department: string | null
          email: string
          faculty_id: string | null
          first_name: string | null
          id: string
          last_active: string | null
          last_name: string | null
          name: string
          organization: string | null
          organization_id: string | null
          role: string
          status: string | null
          tc_number: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          faculty_id?: string | null
          first_name?: string | null
          id: string
          last_active?: string | null
          last_name?: string | null
          name: string
          organization?: string | null
          organization_id?: string | null
          role: string
          status?: string | null
          tc_number?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          faculty_id?: string | null
          first_name?: string | null
          id?: string
          last_active?: string | null
          last_name?: string | null
          name?: string
          organization?: string | null
          organization_id?: string | null
          role?: string
          status?: string | null
          tc_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_faculty"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
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
        Args: { purchase_id: string }
        Returns: {
          id: string
          name: string
          quantity: number
          price: number
          total: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_supervisor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_lab_supervisor: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
