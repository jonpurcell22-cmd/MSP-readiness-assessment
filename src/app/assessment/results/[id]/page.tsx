import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { ResultsContent } from "./results-content"
import type { AssessmentOutput, AssessmentScores } from "@/types/assessment"

type AssessmentRow = {
  id: string
  first_name: string
  scores: AssessmentScores | null
  output: AssessmentOutput | null
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("assessments")
    .select("id, first_name, scores, output")
    .eq("id", id)
    .single()

  if (error || !data) notFound()

  const row = data as unknown as AssessmentRow

  return (
    <ResultsContent
      assessmentId={id}
      firstName={row.first_name ?? ""}
      scores={row.scores}
      existingOutput={row.output}
    />
  )
}
