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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_on: string
          created_at: string
          id: string
          lodged_via: string | null
          note: string | null
          reference_no: string | null
          scheme_id: string
          stage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_on?: string
          created_at?: string
          id?: string
          lodged_via?: string | null
          note?: string | null
          reference_no?: string | null
          scheme_id: string
          stage?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_on?: string
          created_at?: string
          id?: string
          lodged_via?: string | null
          note?: string | null
          reference_no?: string | null
          scheme_id?: string
          stage?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_payments: {
        Row: {
          amount: number
          bank: string | null
          created_at: string
          id: string
          received_on: string
          reference: string | null
          scheme_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          bank?: string | null
          created_at?: string
          id?: string
          received_on?: string
          reference?: string | null
          scheme_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          amount?: number
          bank?: string | null
          created_at?: string
          id?: string
          received_on?: string
          reference?: string | null
          scheme_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_payments_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string | null
          quiz_answers: Json | null
          state_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name?: string | null
          quiz_answers?: Json | null
          state_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string | null
          quiz_answers?: Json | null
          state_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_schemes: {
        Row: {
          created_at: string
          id: string
          scheme_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheme_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scheme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          annual_cash: number
          apply_mode: string
          areas: string[]
          benefit_headline: string
          benefit_label: string
          benefit_note: string | null
          benefit_types: string[]
          benefit_value: number
          category: string
          created_at: string
          deadline_note: string | null
          description: string
          documents: Json
          eligibility_points: Json
          eligibility_summary: string
          excludes_flags: string[]
          exclusions: string[]
          faqs: Json
          genders: string[]
          helpline: string | null
          housing_statuses: string[]
          id: string
          is_dbt: boolean
          land_statuses: string[]
          level: string
          local_name: string | null
          max_age: number | null
          max_income: number | null
          min_age: number | null
          ministry: string
          name: string
          occupations: string[]
          official_url: string
          popularity: number
          requires_flags: string[]
          short_name: string | null
          slug: string
          social_categories: string[]
          state_code: string | null
          steps: Json
          summary: string
          tags: string[]
        }
        Insert: {
          annual_cash?: number
          apply_mode?: string
          areas?: string[]
          benefit_headline: string
          benefit_label: string
          benefit_note?: string | null
          benefit_types?: string[]
          benefit_value?: number
          category: string
          created_at?: string
          deadline_note?: string | null
          description: string
          documents?: Json
          eligibility_points?: Json
          eligibility_summary: string
          excludes_flags?: string[]
          exclusions?: string[]
          faqs?: Json
          genders?: string[]
          helpline?: string | null
          housing_statuses?: string[]
          id?: string
          is_dbt?: boolean
          land_statuses?: string[]
          level: string
          local_name?: string | null
          max_age?: number | null
          max_income?: number | null
          min_age?: number | null
          ministry: string
          name: string
          occupations?: string[]
          official_url: string
          popularity?: number
          requires_flags?: string[]
          short_name?: string | null
          slug: string
          social_categories?: string[]
          state_code?: string | null
          steps?: Json
          summary: string
          tags?: string[]
        }
        Update: {
          annual_cash?: number
          apply_mode?: string
          areas?: string[]
          benefit_headline?: string
          benefit_label?: string
          benefit_note?: string | null
          benefit_types?: string[]
          benefit_value?: number
          category?: string
          created_at?: string
          deadline_note?: string | null
          description?: string
          documents?: Json
          eligibility_points?: Json
          eligibility_summary?: string
          excludes_flags?: string[]
          exclusions?: string[]
          faqs?: Json
          genders?: string[]
          helpline?: string | null
          housing_statuses?: string[]
          id?: string
          is_dbt?: boolean
          land_statuses?: string[]
          level?: string
          local_name?: string | null
          max_age?: number | null
          max_income?: number | null
          min_age?: number | null
          ministry?: string
          name?: string
          occupations?: string[]
          official_url?: string
          popularity?: number
          requires_flags?: string[]
          short_name?: string | null
          slug?: string
          social_categories?: string[]
          state_code?: string | null
          steps?: Json
          summary?: string
          tags?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
