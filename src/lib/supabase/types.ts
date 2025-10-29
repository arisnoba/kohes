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
          created_at: string
          id: string
          is_completed: boolean
          organization_name: string | null
          pii_data: Json | null
          respondent_name: string | null
          response_data: Json
          reward_note: string | null
          reward_sent_at: string | null
          reward_status: "발송 대기" | "정보 확인 중" | "발송 완료"
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          organization_name?: string | null
          pii_data?: Json | null
          respondent_name?: string | null
          response_data: Json
          reward_note?: string | null
          reward_sent_at?: string | null
          reward_status?: "발송 대기" | "정보 확인 중" | "발송 완료"
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          organization_name?: string | null
          pii_data?: Json | null
          respondent_name?: string | null
          response_data?: Json
          reward_note?: string | null
          reward_sent_at?: string | null
          reward_status?: "발송 대기" | "정보 확인 중" | "발송 완료"
          submitted_at?: string
          updated_at?: string
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
