export interface AssessmentContact {
  firstName: string
  lastName: string
  email: string
  vertical?: string
  companySize?: string
}

export interface AssessmentAnswers {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
}

// Point values selected per question (used for score calculation)
export interface AssessmentPoints {
  q1: number
  q2: number
  q3: number
  q4: number
  q5: number
  q6: number
  q7: number
}

export interface AssessmentScores {
  overall: number       // 0-100 rescaled index
  arch: number          // Channel Architecture 0-100
  gtm: number           // Go-to-Market Alignment 0-100
  px: number            // Partner Experience 0-100
  maturityLabel: string // Foundation-Building | Emerging | Developing | Scaling | Optimized
}

export interface AssessmentOutput {
  priority_focus: string
  narrative: string
}

// Supabase database row
export interface AssessmentRow {
  id: string
  created_at: string
  first_name: string
  email: string
  vertical: string | null
  company_size: string | null
  answers: AssessmentAnswers
  scores: AssessmentScores
  output: AssessmentOutput | null
}
