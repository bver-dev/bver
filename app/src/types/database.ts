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
      appeals: {
        Row: {
          actual_savings: number | null
          created_at: string | null
          current_assessed_value: number
          deadline: string | null
          estimated_savings: number | null
          evidence: Json | null
          form_data: Json | null
          id: string
          pdf_url: string | null
          property_id: string
          proposed_value: number
          reasons: Json | null
          resolution: string | null
          resolution_date: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          viability_score: string | null
        }
        Insert: {
          actual_savings?: number | null
          created_at?: string | null
          current_assessed_value: number
          deadline?: string | null
          estimated_savings?: number | null
          evidence?: Json | null
          form_data?: Json | null
          id?: string
          pdf_url?: string | null
          property_id: string
          proposed_value: number
          reasons?: Json | null
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          viability_score?: string | null
        }
        Update: {
          actual_savings?: number | null
          created_at?: string | null
          current_assessed_value?: number
          deadline?: string | null
          estimated_savings?: number | null
          evidence?: Json | null
          form_data?: Json | null
          id?: string
          pdf_url?: string | null
          property_id?: string
          proposed_value?: number
          reasons?: Json | null
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          viability_score?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appeals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_history: {
        Row: {
          assessed_value: number
          assessment_date: string
          confidence_score: number | null
          created_at: string | null
          data_sources: Json | null
          id: string
          market_value: number | null
          model_version: string | null
          property_id: string
        }
        Insert: {
          assessed_value: number
          assessment_date: string
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          id?: string
          market_value?: number | null
          model_version?: string | null
          property_id: string
        }
        Update: {
          assessed_value?: number
          assessment_date?: string
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          id?: string
          market_value?: number | null
          model_version?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          id: string
          user_id: string | null
          address: string
          assessed_value: number | null
          estimated_value: number | null
          over_assessment_amount: number | null
          over_assessment_percentage: number | null
          viability: string | null
          confidence_score: number | null
          data_sources: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          address: string
          assessed_value?: number | null
          estimated_value?: number | null
          over_assessment_amount?: number | null
          over_assessment_percentage?: number | null
          viability?: string | null
          confidence_score?: number | null
          data_sources?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          address?: string
          assessed_value?: number | null
          estimated_value?: number | null
          over_assessment_amount?: number | null
          over_assessment_percentage?: number | null
          viability?: string | null
          confidence_score?: number | null
          data_sources?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          appeal_id: string | null
          created_at: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          property_id: string | null
          user_id: string
        }
        Insert: {
          appeal_id?: string | null
          created_at?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          property_id?: string | null
          user_id: string
        }
        Update: {
          appeal_id?: string | null
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_appeal_id_fkey"
            columns: ["appeal_id"]
            isOneToOne: false
            referencedRelation: "appeals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          assessed_value: number | null
          city: string
          county: string
          created_at: string | null
          id: string
          market_value: number | null
          metadata: Json | null
          parcel_number: string | null
          property_type: string | null
          state: string
          tax_year: number
          updated_at: string | null
          user_id: string
          zip_code: string
        }
        Insert: {
          address: string
          assessed_value?: number | null
          city: string
          county: string
          created_at?: string | null
          id?: string
          market_value?: number | null
          metadata?: Json | null
          parcel_number?: string | null
          property_type?: string | null
          state: string
          tax_year: number
          updated_at?: string | null
          user_id: string
          zip_code: string
        }
        Update: {
          address?: string
          assessed_value?: number | null
          city?: string
          county?: string
          created_at?: string | null
          id?: string
          market_value?: number | null
          metadata?: Json | null
          parcel_number?: string | null
          property_type?: string | null
          state?: string
          tax_year?: number
          updated_at?: string | null
          user_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_data_cache: {
        Row: {
          id: string
          address: string
          api_source: string
          data: Json
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          address: string
          api_source: string
          data: Json
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          address?: string
          api_source?: string
          data?: Json
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never