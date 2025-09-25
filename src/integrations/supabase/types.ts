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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string | null
          farm_id: string
          gender: string | null
          id: string
          name: string | null
          species: string
          status: string | null
          tag_id: string
          updated_at: string | null
          withdrawal_until_meat: string | null
          withdrawal_until_milk: string | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          farm_id: string
          gender?: string | null
          id?: string
          name?: string | null
          species: string
          status?: string | null
          tag_id: string
          updated_at?: string | null
          withdrawal_until_meat?: string | null
          withdrawal_until_milk?: string | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          farm_id?: string
          gender?: string | null
          id?: string
          name?: string | null
          species?: string
          status?: string | null
          tag_id?: string
          updated_at?: string | null
          withdrawal_until_meat?: string | null
          withdrawal_until_milk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_type: string
          animal_id: string | null
          created_at: string | null
          description: string
          farm_id: string
          id: string
          resolved_at: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          alert_type: string
          animal_id?: string | null
          created_at?: string | null
          description: string
          farm_id: string
          id?: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          alert_type?: string
          animal_id?: string | null
          created_at?: string | null
          description?: string
          farm_id?: string
          id?: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          animal_id: string | null
          consultation_type: string | null
          created_at: string | null
          farmer_id: string
          feedback: string | null
          id: string
          notes: string | null
          priority: string | null
          rating: number | null
          scheduled_at: string | null
          status: string | null
          symptoms: string
          updated_at: string | null
          vet_id: string | null
        }
        Insert: {
          animal_id?: string | null
          consultation_type?: string | null
          created_at?: string | null
          farmer_id: string
          feedback?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rating?: number | null
          scheduled_at?: string | null
          status?: string | null
          symptoms: string
          updated_at?: string | null
          vet_id?: string | null
        }
        Update: {
          animal_id?: string | null
          consultation_type?: string | null
          created_at?: string | null
          farmer_id?: string
          feedback?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rating?: number | null
          scheduled_at?: string | null
          status?: string | null
          symptoms?: string
          updated_at?: string | null
          vet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          language: string | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      farms: {
        Row: {
          address: string
          created_at: string | null
          farm_name: string
          id: string
          location: unknown | null
          owner_id: string
          registration_number: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          farm_name: string
          id?: string
          location?: unknown | null
          owner_id: string
          registration_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          farm_name?: string
          id?: string
          location?: unknown | null
          owner_id?: string
          registration_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active_ingredient: string
          created_at: string | null
          dosage_instructions: string | null
          id: string
          med_name: string
          withdrawal_period_meat_days: number
          withdrawal_period_milk_hours: number
        }
        Insert: {
          active_ingredient: string
          created_at?: string | null
          dosage_instructions?: string | null
          id?: string
          med_name: string
          withdrawal_period_meat_days: number
          withdrawal_period_milk_hours: number
        }
        Update: {
          active_ingredient?: string
          created_at?: string | null
          dosage_instructions?: string | null
          id?: string
          med_name?: string
          withdrawal_period_meat_days?: number
          withdrawal_period_milk_hours?: number
        }
        Relationships: []
      }
      prescription_tasks: {
        Row: {
          animal_id: string
          completed_at: string | null
          created_at: string | null
          dosage: string
          farmer_id: string
          id: string
          is_completed: boolean | null
          medication_name: string
          points_awarded: number | null
          scheduled_date: string
          scheduled_time: string
          treatment_id: string
          updated_at: string | null
        }
        Insert: {
          animal_id: string
          completed_at?: string | null
          created_at?: string | null
          dosage: string
          farmer_id: string
          id?: string
          is_completed?: boolean | null
          medication_name: string
          points_awarded?: number | null
          scheduled_date: string
          scheduled_time: string
          treatment_id: string
          updated_at?: string | null
        }
        Update: {
          animal_id?: string
          completed_at?: string | null
          created_at?: string | null
          dosage?: string
          farmer_id?: string
          id?: string
          is_completed?: boolean | null
          medication_name?: string
          points_awarded?: number | null
          scheduled_date?: string
          scheduled_time?: string
          treatment_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      problem_reports: {
        Row: {
          animal_id: string | null
          created_at: string | null
          description: string | null
          farmer_id: string
          id: string
          images: Json | null
          problem_type: string
          responded_at: string | null
          severity: string | null
          status: string | null
          symptoms: string
          updated_at: string | null
          vet_id: string | null
          vet_response: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string | null
          description?: string | null
          farmer_id: string
          id?: string
          images?: Json | null
          problem_type: string
          responded_at?: string | null
          severity?: string | null
          status?: string | null
          symptoms: string
          updated_at?: string | null
          vet_id?: string | null
          vet_response?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string | null
          description?: string | null
          farmer_id?: string
          id?: string
          images?: Json | null
          problem_type?: string
          responded_at?: string | null
          severity?: string | null
          status?: string | null
          symptoms?: string
          updated_at?: string | null
          vet_id?: string | null
          vet_response?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_vet_verified: boolean | null
          phone: string | null
          preferred_language: string | null
          reward_points: number | null
          role: string
          updated_at: string | null
          user_id: string
          vet_license_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_vet_verified?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          reward_points?: number | null
          role: string
          updated_at?: string | null
          user_id: string
          vet_license_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_vet_verified?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          reward_points?: number | null
          role?: string
          updated_at?: string | null
          user_id?: string
          vet_license_id?: string | null
        }
        Relationships: []
      }
      task_schedule: {
        Row: {
          animal_id: string
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          task_type: string
          treatment_id: string | null
        }
        Insert: {
          animal_id: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          task_type: string
          treatment_id?: string | null
        }
        Update: {
          animal_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          task_type?: string
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_schedule_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_schedule_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      testing_reports: {
        Row: {
          animal_id: string
          attachments: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          lab_id: string | null
          notes: string | null
          priority: string | null
          received_at: string | null
          requested_at: string | null
          results: string | null
          sample_type: string
          status: string
          test_description: string | null
          test_type: string
          updated_at: string | null
          vet_id: string
        }
        Insert: {
          animal_id: string
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lab_id?: string | null
          notes?: string | null
          priority?: string | null
          received_at?: string | null
          requested_at?: string | null
          results?: string | null
          sample_type: string
          status?: string
          test_description?: string | null
          test_type: string
          updated_at?: string | null
          vet_id: string
        }
        Update: {
          animal_id?: string
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lab_id?: string | null
          notes?: string | null
          priority?: string | null
          received_at?: string | null
          requested_at?: string | null
          results?: string | null
          sample_type?: string
          status?: string
          test_description?: string | null
          test_type?: string
          updated_at?: string | null
          vet_id?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          animal_id: string
          created_at: string | null
          diagnosis: string
          dosage: string
          id: string
          medication_id: string
          notes: string | null
          route_of_administration: string | null
          treatment_end_date: string | null
          treatment_start_date: string | null
          vet_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          diagnosis: string
          dosage: string
          id?: string
          medication_id: string
          notes?: string | null
          route_of_administration?: string | null
          treatment_end_date?: string | null
          treatment_start_date?: string | null
          vet_id: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          diagnosis?: string
          dosage?: string
          id?: string
          medication_id?: string
          notes?: string | null
          route_of_administration?: string | null
          treatment_end_date?: string | null
          treatment_start_date?: string | null
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
