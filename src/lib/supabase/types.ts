export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
      export_passwords: {
        Row: {
          id: string
          password_hash: string
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          password_hash: string
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          id: string
          user_id: string
          export_type: "all" | "response" | "pii"
          export_format: "csv" | "json" | "xlsx"
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          export_type: "all" | "response" | "pii"
          export_format: "csv" | "json" | "xlsx"
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          export_type?: "all" | "response" | "pii"
          export_format?: "csv" | "json" | "xlsx"
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_export_password: {
        Args: { input_password: string }
        Returns: boolean
      }
      update_export_password: {
        Args: { old_password: string | null; new_password: string; user_id: string }
        Returns: boolean
      }
      log_export: {
        Args: {
          p_user_id: string
          p_export_type: "all" | "response" | "pii"
          p_export_format: "csv" | "json" | "xlsx"
          p_ip_address?: string
          p_user_agent?: string
        }
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
