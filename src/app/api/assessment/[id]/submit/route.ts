import { NextResponse } from "next/server"

/** This route is no longer used in v2.0. */
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
