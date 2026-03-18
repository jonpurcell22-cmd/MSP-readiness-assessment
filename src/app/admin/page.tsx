"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Lock,
  Users,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string
  full_name: string
  company_name: string
  title: string | null
  email: string
  path: string | null
  path_label: string | null
  ai_output: string | null
  open_text: string | null
  completed_at: string | null
  created_at: string
}

type SortField = "created_at" | "full_name" | "company_name" | "path"
type SortDir = "asc" | "desc"

// ─── Constants ────────────────────────────────────────────────────────────────

const KNOWN_PATHS = new Set(["Starting from Scratch", "Not Producing Revenue", "Producing but Broken"])

const PATH_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Starting from Scratch":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Not Producing Revenue":  { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
  "Producing but Broken":   { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PathBadge({ label }: { label: string | null }) {
  if (!label) return <span style={{ color: "#8b8b9a", fontSize: 13 }}>—</span>

  if (!KNOWN_PATHS.has(label)) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB",
        borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 500,
      }}>
        Legacy
      </span>
    )
  }

  const s = PATH_STYLES[label]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  )
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) {
  const active = field === sortField
  if (!active) return <ChevronUp style={{ width: 12, height: 12, opacity: 0.3 }} />
  return sortDir === "asc"
    ? <ChevronUp  style={{ width: 12, height: 12, color: "#4cf37b" }} />
    : <ChevronDown style={{ width: 12, height: 12, color: "#4cf37b" }} />
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#111118", borderRadius: 10 }}>
      <CardContent style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 20px" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
          background: "rgba(76,243,123,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 11, color: "#8b8b9a", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.2 }}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Assessment | null>(null)

  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectAllRef = useRef<HTMLInputElement>(null)

  const fetchAssessments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/assessments")
      if (res.status === 401) { setAuthenticated(false); return }
      if (res.ok) {
        const data = await res.json()
        setAssessments(data)
        setCheckedIds(new Set())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) fetchAssessments()
  }, [authenticated, fetchAssessments])

  // Keep indeterminate state on select-all checkbox
  useEffect(() => {
    const el = selectAllRef.current
    if (!el) return
    const allIds = sorted.map((a) => a.id)
    const checkedCount = allIds.filter((id) => checkedIds.has(id)).length
    el.indeterminate = checkedCount > 0 && checkedCount < allIds.length
  })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError("")
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthenticated(true)
      } else {
        const data = await res.json()
        setLoginError(data.error || "Invalid password")
      }
    } catch {
      setLoginError("Login failed")
    } finally {
      setLoggingIn(false)
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const allIds = sorted.map((a) => a.id)
    const allChecked = allIds.every((id) => checkedIds.has(id))
    if (allChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(allIds))
    }
  }

  async function handleDeleteConfirmed() {
    setDeleting(true)
    try {
      const res = await fetch("/api/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(checkedIds) }),
      })
      if (res.ok) {
        setShowDeleteConfirm(false)
        await fetchAssessments()
      }
    } finally {
      setDeleting(false)
    }
  }

  const completed = assessments.filter((a) => a.completed_at)
  const thisWeek = new Date(); thisWeek.setDate(thisWeek.getDate() - 7)
  const weekCount = assessments.filter((a) => new Date(a.created_at) >= thisWeek).length

  const sorted = [...assessments].sort((a, b) => {
    const get = (x: Assessment): string => {
      if (sortField === "created_at") return x.created_at
      if (sortField === "full_name") return x.full_name?.toLowerCase() ?? ""
      if (sortField === "company_name") return x.company_name?.toLowerCase() ?? ""
      if (sortField === "path") return x.path_label?.toLowerCase() ?? ""
      return ""
    }
    const av = get(a), bv = get(b)
    if (av < bv) return sortDir === "asc" ? -1 : 1
    if (av > bv) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const allChecked = sorted.length > 0 && sorted.every((a) => checkedIds.has(a.id))

  // ── Login gate ──────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ width: "100%", maxWidth: 360, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", background: "#111118" }}>
          <CardHeader style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: "#1e1e2a",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
            }}>
              <Lock style={{ width: 20, height: 20, color: "#4cf37b" }} />
            </div>
            <CardTitle style={{ fontSize: 17, fontWeight: 700, color: "#ffffff" }}>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label htmlFor="password" style={{ fontSize: 13, color: "#8b8b9a" }}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                />
              </div>
              {loginError && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{loginError}</p>}
              <Button
                type="submit"
                disabled={loggingIn}
                style={{ background: "linear-gradient(135deg, #4cf37b 0%, #2dd460 100%)", color: "#0a0a0f", fontWeight: 700, border: "none" }}
              >
                {loggingIn ? "Logging in…" : "Log In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Top bar */}
      <div style={{ background: "#0a0a0f", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4cf37b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Untapped Channel Strategy
            </span>
            <span style={{ color: "#666", fontSize: 13 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>Assessment Dashboard</span>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" })
              setAuthenticated(false)
            }}
            style={{ fontSize: 13, color: "#8b8b9a", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard
            icon={<Users style={{ width: 18, height: 18, color: "#4cf37b" }} />}
            label="Total Leads"
            value={assessments.length}
          />
          <StatCard
            icon={<CheckCircle2 style={{ width: 18, height: 18, color: "#4cf37b" }} />}
            label="Completed"
            value={completed.length}
          />
          <StatCard
            icon={<Calendar style={{ width: 18, height: 18, color: "#4cf37b" }} />}
            label="This Week"
            value={weekCount}
          />
        </div>

        {/* Table card */}
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
          {/* Card header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>All Assessments</span>
            {checkedIds.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                Delete {checkedIds.size} selected
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 44, borderRadius: 6, background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {/* Select all */}
                    <th style={{ width: 44, padding: "10px 0 10px 16px", textAlign: "center" }}>
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleSelectAll}
                        style={{ width: 15, height: 15, accentColor: "#4cf37b", cursor: "pointer" }}
                      />
                    </th>
                    {(
                      [
                        { key: "created_at",   label: "Date" },
                        { key: "full_name",    label: "Name" },
                        { key: "company_name", label: "Company" },
                        { key: null,           label: "Title" },
                        { key: null,           label: "Email" },
                        { key: "path",         label: "Path" },
                        { key: null,           label: "Status" },
                        { key: null,           label: "" },
                      ] as { key: SortField | null; label: string }[]
                    ).map((col, i) => (
                      <th
                        key={i}
                        onClick={col.key ? () => handleSort(col.key as SortField) : undefined}
                        style={{
                          padding: "10px 14px", textAlign: "left",
                          fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: "#8b8b9a",
                          cursor: col.key ? "pointer" : "default",
                          userSelect: "none", whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {col.label}
                          {col.key && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a, i) => {
                    const isChecked = checkedIds.has(a.id)
                    return (
                      <tr
                        key={a.id}
                        style={{
                          borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          background: isChecked ? "rgba(76,243,123,0.06)" : "transparent",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => { if (!isChecked) (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = isChecked ? "rgba(76,243,123,0.06)" : "transparent" }}
                      >
                        <td style={{ padding: "12px 0 12px 16px", textAlign: "center", width: 44 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(a.id)}
                            style={{ width: 15, height: 15, accentColor: "#4cf37b", cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "12px 14px", color: "#8b8b9a", whiteSpace: "nowrap" }}>
                          {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap" }}>
                          {a.full_name || "—"}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#c8c8d4", whiteSpace: "nowrap" }}>
                          {a.company_name || "—"}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#8b8b9a", whiteSpace: "nowrap" }}>
                          {a.title || "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <a
                            href={`mailto:${a.email}`}
                            style={{ color: "#4cf37b", textDecoration: "none", fontWeight: 500 }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            {a.email}
                          </a>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <PathBadge label={a.path_label} />
                        </td>
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          {a.completed_at ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#4cf37b" }}>
                              <CheckCircle2 style={{ width: 13, height: 13 }} />
                              Complete
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Incomplete</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button
                              onClick={() => setSelected(a)}
                              style={{
                                fontSize: 12, fontWeight: 600, color: "#ffffff",
                                background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                              }}
                            >
                              View
                            </button>
                            {a.completed_at && (
                              <a
                                href={`/assessment/results/${a.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  width: 28, height: 28, borderRadius: 6,
                                  background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", color: "#8b8b9a",
                                }}
                              >
                                <ExternalLink style={{ width: 13, height: 13 }} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: "48px 16px", textAlign: "center", color: "#8b8b9a", fontSize: 14 }}>
                        No assessments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[88vh] max-w-[660px] overflow-y-auto" style={{ background: "#111118", color: "#ffffff" }}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}>
                  {selected.company_name}
                </DialogTitle>
              </DialogHeader>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Contact grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                  {[
                    { label: "Name",     value: selected.full_name || "—" },
                    { label: "Title",    value: selected.title || "—" },
                    { label: "Email",    value: selected.email, isEmail: true },
                    { label: "Path",     value: null, badge: true },
                    { label: "Started",  value: new Date(selected.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                    ...(selected.completed_at ? [{
                      label: "Completed",
                      value: new Date(selected.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                    }] : []),
                  ].map(({ label, value, isEmail, badge }) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, color: "#8b8b9a", margin: "0 0 3px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                      {badge
                        ? <PathBadge label={selected.path_label} />
                        : isEmail
                          ? <a href={`mailto:${value}`} style={{ fontSize: 14, fontWeight: 500, color: "#4cf37b", textDecoration: "none" }}>{value}</a>
                          : <p style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", margin: 0 }}>{value as string}</p>
                      }
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                {/* Open text */}
                {selected.open_text && (
                  <>
                    <div>
                      <p style={{ fontSize: 11, color: "#8b8b9a", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Additional Context
                      </p>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "16px 18px" }}>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7, color: "#ffffff", margin: 0 }}>
                          {selected.open_text}
                        </p>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                  </>
                )}

                {/* AI Output */}
                <div>
                  <p style={{ fontSize: 11, color: "#8b8b9a", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    AI Diagnosis
                  </p>
                  {selected.ai_output ? (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "16px 18px" }}>
                      <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7, color: "#ffffff", margin: 0 }}>
                        {selected.ai_output}
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#8b8b9a" }}>
                      {selected.completed_at
                        ? "AI output not yet generated — open the results page to trigger generation."
                        : "Assessment not yet completed."}
                    </div>
                  )}
                </div>

                {/* Results link */}
                {selected.completed_at && (
                  <a
                    href={`/assessment/results/${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
                      background: "#4cf37b", color: "#0a0a0f",
                      fontSize: 13, fontWeight: 700, textDecoration: "none",
                      padding: "10px 18px", borderRadius: 7,
                    }}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    View Results Page
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ────────────────────────────────────────── */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent style={{ maxWidth: 400, background: "#111118", color: "#ffffff" }}>
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8, color: "#ffffff" }}>
              <AlertTriangle style={{ width: 18, height: 18, color: "#DC2626" }} />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 14, color: "#c8c8d4", margin: "4px 0 20px" }}>
            Delete <strong>{checkedIds.size}</strong> assessment{checkedIds.size !== 1 ? "s" : ""}? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{ fontSize: 13, fontWeight: 600, color: "#c8c8d4", background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              disabled={deleting}
              style={{ fontSize: 13, fontWeight: 700, color: "#f87171", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 16px", cursor: "pointer", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "Deleting…" : `Delete ${checkedIds.size}`}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
