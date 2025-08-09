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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      property_data_cache: {
        Row: {
          address: string
          api_response: Json
          city: string | null
          created_at: string | null
          data_source: string
          id: string
          lat: number | null
          lng: number | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          api_response: Json
          city?: string | null
          created_at?: string | null
          data_source: string
          id?: string
          lat?: number | null
          lng?: number | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          api_response?: Json
          city?: string | null
          created_at?: string | null
          data_source?: string
          id?: string
          lat?: number | null
          lng?: number | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
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
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}