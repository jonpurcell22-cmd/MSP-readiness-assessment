"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TierBadge } from "@/components/tier-badge"
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
import { ScoreBar } from "@/components/score-bar"
import { sections } from "@/lib/assessment-data"
import { toPercentageScore } from "@/lib/scoring"
import {
  Lock,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react"

interface Assessment {
  id: string
  company_name: string
  contact_name: string
  title: string | null
  email: string
  phone: string | null
  total_score: number | null
  tier: string | null
  section_scores: Record<string, number> | null
  answers: Record<string, unknown> | null
  completed_at: string | null
  created_at: string
}

export default function AdminPage() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null)
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const authenticated = !!authToken

  const fetchAssessments = useCallback(async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/assessments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setAuthToken(null)
        return
      }
      if (res.ok) {
        const data = await res.json()
        setAssessments(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authToken) {
      fetchAssessments(authToken)
    }
  }, [authToken, fetchAssessments])

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

      const data = await res.json()

      if (res.ok && data.token) {
        setAuthToken(data.token)
      } else {
        setLoginError(data.error || "Invalid password")
      }
    } catch {
      setLoginError("Login failed")
    } finally {
      setLoggingIn(false)
    }
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const sortedAssessments = [...assessments].sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null

    switch (sortField) {
      case "created_at":
        aVal = a.created_at
        bVal = b.created_at
        break
      case "company_name":
        aVal = a.company_name?.toLowerCase() || ""
        bVal = b.company_name?.toLowerCase() || ""
        break
      case "total_score":
        aVal = a.total_score || 0
        bVal = b.total_score || 0
        break
      case "tier":
        aVal = a.tier || ""
        bVal = b.tier || ""
        break
      default:
        return 0
    }

    if (aVal === null || bVal === null) return 0
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1
    return 0
  })

  // Stats
  const completedAssessments = assessments.filter((a) => a.completed_at)
  const avgScore =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce(
            (s, a) => s + toPercentageScore(a.total_score || 0),
            0
          ) / completedAssessments.length
        )
      : 0

  const tierCounts: Record<string, number> = {}
  completedAssessments.forEach((a) => {
    if (a.tier) tierCounts[a.tier] = (tierCounts[a.tier] || 0) + 1
  })
  const mostCommonTier =
    Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  const weekCount = assessments.filter(
    (a) => new Date(a.created_at) >= thisWeek
  ).length

  // Password gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6">
          <Card className="w-full max-w-[400px] border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-subtle)]">
                <Lock className="h-5 w-5 text-[var(--brand-dark)]" />
              </div>
              <CardTitle className="text-lg text-[var(--brand-dark)]">
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-destructive">{loginError}</p>
                )}
                <Button
                  type="submit"
                  disabled={loggingIn}
                  className="bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold"
                >
                  {loggingIn ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!authToken) return
              const res = await fetch("/api/admin/export", {
                headers: { Authorization: `Bearer ${authToken}` },
              })
              if (res.ok) {
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `assessments-${new Date().toISOString().split("T")[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }
            }}
          >
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border">
            <CardContent className="flex flex-col gap-1 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Assessments</span>
              </div>
              <p className="text-2xl font-bold text-[var(--brand-dark)]">
                {assessments.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex flex-col gap-1 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Average Score</span>
              </div>
              <p className="text-2xl font-bold text-[var(--brand-dark)]">
                {avgScore}/100
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex flex-col gap-1 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Most Common Tier</span>
              </div>
              <p className="text-lg font-bold text-[var(--brand-dark)]">
                {mostCommonTier}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex flex-col gap-1 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">This Week</span>
              </div>
              <p className="text-2xl font-bold text-[var(--brand-dark)]">
                {weekCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--brand-dark)]">
              All Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        { key: "created_at", label: "Date" },
                        { key: "company_name", label: "Company" },
                        { key: "contact_name", label: "Contact" },
                        { key: "title", label: "Title" },
                        { key: "email", label: "Email" },
                        { key: "product_category", label: "Category" },
                        { key: "total_score", label: "Score" },
                        { key: "tier", label: "Tier" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="cursor-pointer pb-3 pr-4 text-left font-semibold text-[var(--brand-dark)] hover:text-[var(--brand-green)]"
                          onClick={() => handleSort(col.key)}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </th>
                      ))}
                      <th className="pb-3 text-left font-semibold text-[var(--brand-dark)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssessments.map((a, i) => (
                      <tr
                        key={a.id}
                        className={`border-b border-border last:border-0 ${
                          i % 2 === 0 ? "bg-[#F4F4F4]" : ""
                        }`}
                      >
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {a.company_name}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          {a.contact_name}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.title || "---"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.email}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {(a.answers as Record<string, unknown>)
                            ?.product_category as string || "---"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-foreground">
                          {a.total_score != null
                            ? `${toPercentageScore(a.total_score)}/100`
                            : "---"}
                        </td>
                        <td className="py-3 pr-4">
                          {a.tier ? (
                            <TierBadge tier={a.tier} />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAssessment(a)}
                            >
                              View
                            </Button>
                            {a.completed_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`/assessment/results/${a.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedAssessments.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No assessments yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedAssessment}
        onOpenChange={() => setSelectedAssessment(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-[700px] overflow-y-auto">
          {selectedAssessment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--brand-dark)]">
                  {selectedAssessment.company_name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.contact_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(
                        selectedAssessment.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Score Summary */}
                {selectedAssessment.total_score !== null && (
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-[var(--brand-dark)]">
                      {toPercentageScore(selectedAssessment.total_score ?? 0)}/100
                    </div>
                    {selectedAssessment.tier && (
                      <TierBadge tier={selectedAssessment.tier} />
                    )}
                  </div>
                )}

                {/* Section Scores */}
                {selectedAssessment.section_scores && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-[var(--brand-dark)]">
                      Section Scores
                    </h3>
                    {sections.map((section) => (
                      <div key={section.id} className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">
                          {section.title}
                        </p>
                        <ScoreBar
                          score={
                            selectedAssessment.section_scores?.[section.id] || 0
                          }
                          max={25}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* View Results Link */}
                {selectedAssessment.completed_at && (
                  <Button
                    className="bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-semibold"
                    asChild
                  >
                    <a
                      href={`/assessment/results/${selectedAssessment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Results
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
