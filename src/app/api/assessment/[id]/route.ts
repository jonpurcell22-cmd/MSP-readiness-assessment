import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/** GET: return assessment row by id */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Assessment not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
