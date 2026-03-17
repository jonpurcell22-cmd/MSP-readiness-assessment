import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { isV2Assessment } from "@/lib/generate-output"
import { ResultsContent } from "./results-content"
import type { Database } from "@/types/supabase"

type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"]

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) notFound()

  const row = data as unknown as AssessmentRow
  const firstName = (row.full_name ?? "").trim().split(/\s+/)[0] || ""
  const narrative = row.ai_narrative
  const isV2 = isV2Assessment(narrative)
  const existingOutput = isV2 && narrative.output ? narrative.output : null

  return (
    <ResultsContent
      assessmentId={id}
      firstName={firstName}
      existingOutput={existingOutput}
    />
  )
}
