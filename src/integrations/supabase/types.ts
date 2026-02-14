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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_goal_completions: {
        Row: {
          admin_goal_id: string
          completed_at: string
          completion_date: string
          gregorian_date: string
          id: string
          user_id: string
        }
        Insert: {
          admin_goal_id: string
          completed_at?: string
          completion_date: string
          gregorian_date: string
          id?: string
          user_id: string
        }
        Update: {
          admin_goal_id?: string
          completed_at?: string
          completion_date?: string
          gregorian_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_goal_completions_admin_goal_id_fkey"
            columns: ["admin_goal_id"]
            isOneToOne: false
            referencedRelation: "admin_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_goals: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          is_published: boolean
          recurrence_days: number[] | null
          recurrence_pattern: Json | null
          recurrence_type: string
          sort_order: number
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_published?: boolean
          recurrence_days?: number[] | null
          recurrence_pattern?: Json | null
          recurrence_type?: string
          sort_order?: number
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_published?: boolean
          recurrence_days?: number[] | null
          recurrence_pattern?: Json | null
          recurrence_type?: string
          sort_order?: number
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      due_payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          calendar_type: string
          created_at: string
          due_month: number
          due_type: string
          due_year: number
          id: string
          paid_at: string | null
          reference_id: string
          user_id: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          calendar_type: string
          created_at?: string
          due_month: number
          due_type: string
          due_year: number
          id?: string
          paid_at?: string | null
          reference_id: string
          user_id: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          calendar_type?: string
          created_at?: string
          due_month?: number
          due_type?: string
          due_year?: number
          id?: string
          paid_at?: string | null
          reference_id?: string
          user_id?: string
        }
        Relationships: []
      }
      fmb_hubs: {
        Row: {
          calendar_type: string
          created_at: string
          end_month: number | null
          end_year: number | null
          id: string
          is_active: boolean
          monthly_amount: number
          reminder_day: number | null
          reminder_type: string
          sabeel_id: string
          start_month: number
          start_year: number
          updated_at: string
        }
        Insert: {
          calendar_type?: string
          created_at?: string
          end_month?: number | null
          end_year?: number | null
          id?: string
          is_active?: boolean
          monthly_amount: number
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id: string
          start_month: number
          start_year: number
          updated_at?: string
        }
        Update: {
          calendar_type?: string
          created_at?: string
          end_month?: number | null
          end_year?: number | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id?: string
          start_month?: number
          start_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fmb_hubs_sabeel_id_fkey"
            columns: ["sabeel_id"]
            isOneToOne: false
            referencedRelation: "sabeels"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_completions: {
        Row: {
          completed_at: string
          completion_date: string
          goal_id: string
          gregorian_date: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completion_date: string
          goal_id: string
          gregorian_date: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completion_date?: string
          goal_id?: string
          gregorian_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_completions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          is_active: boolean
          recurrence_days: number[] | null
          recurrence_pattern: Json | null
          recurrence_type: string
          sort_order: number
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          recurrence_days?: number[] | null
          recurrence_pattern?: Json | null
          recurrence_type?: string
          sort_order?: number
          start_date?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          recurrence_days?: number[] | null
          recurrence_pattern?: Json | null
          recurrence_type?: string
          sort_order?: number
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      khumus: {
        Row: {
          calculation_type: string
          calendar_type: string
          created_at: string
          fixed_amount: number | null
          id: string
          is_active: boolean
          monthly_income: number | null
          percentage_rate: number | null
          person_name: string
          reminder_day: number | null
          reminder_type: string
          sabeel_id: string
          updated_at: string
        }
        Insert: {
          calculation_type?: string
          calendar_type?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          monthly_income?: number | null
          percentage_rate?: number | null
          person_name: string
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id: string
          updated_at?: string
        }
        Update: {
          calculation_type?: string
          calendar_type?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          monthly_income?: number | null
          percentage_rate?: number | null
          person_name?: string
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "khumus_sabeel_id_fkey"
            columns: ["sabeel_id"]
            isOneToOne: false
            referencedRelation: "sabeels"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          gregorian_date: string
          id: string
          prayer: string
          prayer_date: string
          qaza_completed_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          gregorian_date: string
          id?: string
          prayer: string
          prayer_date: string
          qaza_completed_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          gregorian_date?: string
          id?: string
          prayer?: string
          prayer_date?: string
          qaza_completed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sabeels: {
        Row: {
          calendar_type: string
          created_at: string
          end_month: number | null
          end_year: number | null
          id: string
          is_active: boolean
          monthly_amount: number
          reminder_day: number | null
          reminder_type: string
          sabeel_name: string
          start_month: number
          start_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_type?: string
          created_at?: string
          end_month?: number | null
          end_year?: number | null
          id?: string
          is_active?: boolean
          monthly_amount: number
          reminder_day?: number | null
          reminder_type?: string
          sabeel_name: string
          start_month: number
          start_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_type?: string
          created_at?: string
          end_month?: number | null
          end_year?: number | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          reminder_day?: number | null
          reminder_type?: string
          sabeel_name?: string
          start_month?: number
          start_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          dynamic_goals_enabled: boolean
          goal_sort_order: Json | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          dynamic_goals_enabled?: boolean
          goal_sort_order?: Json | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          dynamic_goals_enabled?: boolean
          goal_sort_order?: Json | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zakats: {
        Row: {
          assets_value: number | null
          calculation_type: string
          calendar_type: string
          created_at: string
          fixed_amount: number | null
          id: string
          is_active: boolean
          nisab_threshold: number | null
          person_name: string
          reminder_day: number | null
          reminder_type: string
          sabeel_id: string
          updated_at: string
          zakat_rate: number | null
        }
        Insert: {
          assets_value?: number | null
          calculation_type?: string
          calendar_type?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          nisab_threshold?: number | null
          person_name: string
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id: string
          updated_at?: string
          zakat_rate?: number | null
        }
        Update: {
          assets_value?: number | null
          calculation_type?: string
          calendar_type?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          nisab_threshold?: number | null
          person_name?: string
          reminder_day?: number | null
          reminder_type?: string
          sabeel_id?: string
          updated_at?: string
          zakat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "zakats_sabeel_id_fkey"
            columns: ["sabeel_id"]
            isOneToOne: false
            referencedRelation: "sabeels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_sabeel: {
        Args: { _sabeel_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
