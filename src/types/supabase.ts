/**
 * Supabase database types for the assessments table.
 * Extend when you add more tables or run codegen.
 */

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string;
          created_at: string;

          full_name: string;
          email: string;
          phone: string;
          title: string;
          company_name: string;
          company_website: string | null;
          product_category: string;

          arr: number | null;
          acv: number | null;
          customer_count: number | null;
          direct_revenue_pct: number | null;
          sales_cycle_days: number | null;
          cac: number | null;
          existing_msp_relationships: string | null;

          section_1_scores: Record<string, number> | null;
          section_2_scores: Record<string, number> | null;
          section_3_scores: Record<string, number> | null;
          section_4_scores: Record<string, number> | null;
          section_5_scores: Record<string, number> | null;
          section_6_scores: Record<string, number> | null;
          section_7_scores: Record<string, number> | null;
          section_7_skipped: boolean;

          section_1_total: number | null;
          section_2_total: number | null;
          section_3_total: number | null;
          section_4_total: number | null;
          section_5_total: number | null;
          section_6_total: number | null;
          section_7_total: number | null;
          overall_score: number | null;
          readiness_tier: string | null;
          red_flags: string[] | null;

          pdf_url: string | null;
          ai_narrative: Record<string, unknown> | null;
        };
        Insert: Omit<Database["public"]["Tables"]["assessments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assessments"]["Insert"]>;
      };
    };
  };
}
