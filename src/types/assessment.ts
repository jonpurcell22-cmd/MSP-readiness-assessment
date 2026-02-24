/**
 * MSP Channel Readiness Assessment - Type definitions
 * Matches the spec and Supabase assessments table.
 */

// --- Contact & lead capture ---

export type TitleOption =
  | "CEO/Founder"
  | "CRO"
  | "VP of Sales"
  | "VP/Head of Partnerships"
  | "Other";

export type ProductCategory =
  | "Cybersecurity"
  | "Backup & DR"
  | "Compliance / GRC"
  | "Identity / IAM"
  | "IT Operations"
  | "SaaS Management"
  | "Email Security"
  | "Other";

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  title: TitleOption | "";
  companyName: string;
  companyWebsite: string;
  productCategory: ProductCategory | "";
}

// --- Financial context ---

export type ExistingMspRelationships = "yes" | "no" | "not_sure";

export interface FinancialData {
  arr: number | null;
  acv: number | null;
  customerCount: number | null;
  directRevenuePct: number; // 0-100
  salesCycleDays: number | null;
  cac: number | null;
  existingMspRelationships: ExistingMspRelationships | null;
}

// --- Section scores: 5 questions per section, each 1-5 ---

export interface SectionScores {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}

export type SectionKey =
  | "section1"
  | "section2"
  | "section3"
  | "section4"
  | "section5"
  | "section6"
  | "section7";

// --- Computed results ---

export type ReadinessTier = "ready" | "capable" | "emerging" | "premature";

export interface SectionTotals {
  section1: number;
  section2: number;
  section3: number;
  section4: number;
  section5: number;
  section6: number;
  section7: number | null; // null when section 7 skipped (greenfield)
}

export interface ComputedResults {
  sectionTotals: SectionTotals;
  overallScore: number; // 0-100
  readinessTier: ReadinessTier;
  redFlags: string[];
  section7Skipped: boolean;
}

// --- Full assessment state (Zustand + submission payload) ---

export interface AssessmentState {
  contact: ContactInfo;
  financials: FinancialData;
  section1: SectionScores | null;
  section2: SectionScores | null;
  section3: SectionScores | null;
  section4: SectionScores | null;
  section5: SectionScores | null;
  section6: SectionScores | null;
  section7: SectionScores | null;
  section7Skipped: boolean | null; // null = not yet answered gate question
  computed: ComputedResults | null; // set after scoring
}

// --- Database row (Supabase assessments table) ---

export interface AssessmentRow {
  id?: string;
  created_at?: string;

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

  pdf_url?: string | null;
  ai_narrative?: Record<string, unknown> | null;
}

// --- Assessment section UI (for reusable section component) ---

export interface AssessmentQuestionOption {
  score: 1 | 2 | 3 | 4 | 5;
  shortLabel: string; // 15-25 words max visible
  fullDescription: string;
}

export interface AssessmentQuestion {
  name: string;
  context: string;
  questionKey: keyof SectionScores;
  options: [
    AssessmentQuestionOption,
    AssessmentQuestionOption,
    AssessmentQuestionOption,
    AssessmentQuestionOption,
    AssessmentQuestionOption,
  ];
}

export interface AssessmentSectionConfig {
  sectionKey: SectionKey;
  sectionNumber: number;
  title: string;
  description: string;
  questions: [
    AssessmentQuestion,
    AssessmentQuestion,
    AssessmentQuestion,
    AssessmentQuestion,
    AssessmentQuestion,
  ];
}
