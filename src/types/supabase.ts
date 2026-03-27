/**
 * Supabase database types for the assessments table.
 * Reflects the schema after migration 004_add_last_name.sql.
 */

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          vertical: string | null
          company_size: string | null
          answers: unknown
          scores: unknown
          output: unknown
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          vertical?: string | null
          company_size?: string | null
          answers?: unknown
          scores?: unknown
          output?: unknown
        }
        Update: Partial<Database["public"]["Tables"]["assessments"]["Insert"]>
      }
    }
  }
}
