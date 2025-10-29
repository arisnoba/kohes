// Supabase database types will be generated here
// Run: supabase gen types typescript --local > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      survey_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          response_data: Json
          pii_data: Json | null
          is_completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          response_data: Json
          pii_data?: Json | null
          is_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          response_data?: Json
          pii_data?: Json | null
          is_completed?: boolean
        }
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
  }
}

