"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TierBadge } from "@/components/tier-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreBar } from "@/components/score-bar";
import { sections } from "@/lib/assessment-data";
import { toPercentageScore, TIER_LABELS } from "@/lib/scoring";
import type { ReadinessTier } from "@/types/assessment";
import {
  Lock,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  ExternalLink,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

/** API row shape (Supabase assessments table). */
interface AssessmentRow {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  company_name: string;
  company_website: string | null;
  product_category: string;
  section_1_total: number | null;
  section_2_total: number | null;
  section_3_total: number | null;
  section_4_total: number | null;
  section_5_total: number | null;
  section_6_total: number | null;
  section_7_total: number | null;
  section_7_skipped?: boolean;
  overall_score: number | null;
  readiness_tier: string | null;
}

function buildSectionScores(row: AssessmentRow): Record<string, number> {
  return {
    section1: row.section_1_total ?? 0,
    section2: row.section_2_total ?? 0,
    section3: row.section_3_total ?? 0,
    section4: row.section_4_total ?? 0,
    section5: row.section_5_total ?? 0,
    section6: row.section_6_total ?? 0,
    section7: row.section_7_skipped ? 0 : (row.section_7_total ?? 0),
  };
}

function exportCSV(rows: AssessmentRow[]) {
  const headers = [
    "Date",
    "Company",
    "Contact",
    "Title",
    "Email",
    "Category",
    "Score",
    "Tier",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        new Date(r.created_at).toISOString().split("T")[0],
        `"${(r.company_name ?? "").replace(/"/g, '""')}"`,
        `"${(r.full_name ?? "").replace(/"/g, '""')}"`,
        `"${(r.title ?? "").replace(/"/g, '""')}"`,
        r.email ?? "",
        `"${(r.product_category ?? "").replace(/"/g, '""')}"`,
        r.overall_score ?? "",
        TIER_LABELS[(r.readiness_tier as ReadinessTier) ?? "emerging"] ??
          r.readiness_tier ??
          "",
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `assessments-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [authFailed, setAuthFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentRow | null>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<
    { type: "single"; id: string; companyName: string } | { type: "bulk"; count: number } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const authenticated = !authFailed;

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setAuthFailed(false);
    try {
      const res = await fetch("/api/admin/assessments", {
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthFailed(true);
        setAssessments([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAssessments(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPassword("");
        fetchAssessments();
      } else {
        setLoginError(data.error ?? "Invalid password");
      }
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthFailed(true);
    setAssessments([]);
    setSelectedAssessment(null);
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sortedAssessments = [...assessments].sort((a, b) => {
    let aVal: string | number | null = null;
    let bVal: string | number | null = null;

    switch (sortField) {
      case "created_at":
        aVal = a.created_at;
        bVal = b.created_at;
        break;
      case "company_name":
        aVal = a.company_name?.toLowerCase() ?? "";
        bVal = b.company_name?.toLowerCase() ?? "";
        break;
      case "contact_name":
        aVal = a.full_name?.toLowerCase() ?? "";
        bVal = b.full_name?.toLowerCase() ?? "";
        break;
      case "title":
        aVal = a.title ?? "";
        bVal = b.title ?? "";
        break;
      case "email":
        aVal = a.email ?? "";
        bVal = b.email ?? "";
        break;
      case "product_category":
        aVal = a.product_category?.toLowerCase() ?? "";
        bVal = b.product_category?.toLowerCase() ?? "";
        break;
      case "total_score":
        aVal = a.overall_score ?? 0;
        bVal = b.overall_score ?? 0;
        break;
      case "tier":
        aVal = a.readiness_tier ?? "";
        bVal = b.readiness_tier ?? "";
        break;
      default:
        return 0;
    }

    if (aVal === null || bVal === null) return 0;
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const completedAssessments = assessments.filter((a) => a.readiness_tier);
  const avgScore =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce(
            (s, a) => s + toPercentageScore(a.overall_score ?? 0),
            0
          ) / completedAssessments.length
        )
      : 0;

  const tierCounts: Record<string, number> = {};
  completedAssessments.forEach((a) => {
    if (a.readiness_tier)
      tierCounts[a.readiness_tier] = (tierCounts[a.readiness_tier] ?? 0) + 1;
  });
  const mostCommonTier =
    Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
  const mostCommonTierLabel =
    TIER_LABELS[mostCommonTier as ReadinessTier] ?? mostCommonTier;

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const weekCount = assessments.filter(
    (a) => new Date(a.created_at) >= thisWeek
  ).length;

  async function handlePdf(id: string, action: "view" | "download") {
    setPdfError(null);
    setPdfLoadingId(id);
    try {
      const res = await fetch(`/api/admin/assessments/${id}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPdfError((body as { error?: string })?.error ?? res.statusText);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (action === "view") {
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download =
          res.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ??
          `assessment-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Failed to load PDF");
    } finally {
      setPdfLoadingId(null);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === sortedAssessments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAssessments.map((a) => a.id)));
    }
  }

  async function handleDeleteSingle(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/assessments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPdfError((data as { error?: string })?.error ?? "Delete failed");
        return;
      }
      setDeleteConfirm(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await fetchAssessments();
      if (selectedAssessment?.id === id) setSelectedAssessment(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteBulk(ids: string[]) {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/assessments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPdfError((data as { error?: string })?.error ?? "Bulk delete failed");
        return;
      }
      setDeleteConfirm(null);
      setSelectedIds(new Set());
      await fetchAssessments();
      if (selectedAssessment && ids.includes(selectedAssessment.id))
        setSelectedAssessment(null);
    } finally {
      setDeleting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6 py-8">
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
                  className="bg-[var(--brand-green)] font-semibold text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90"
                >
                  {loggingIn ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        rightContent={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(assessments)}
            >
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        }
      />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8">
        {pdfError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>{pdfError}</span>
            <button
              type="button"
              onClick={() => setPdfError(null)}
              className="font-medium underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

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
                {mostCommonTierLabel}
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

        <Card className="border-border">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg text-[var(--brand-dark)]">
              All Assessments
            </CardTitle>
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                disabled={deleting}
                onClick={() =>
                  setDeleteConfirm({ type: "bulk", count: selectedIds.size })
                }
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Selected ({selectedIds.size})
              </Button>
            )}
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
                      <th className="w-10 pb-3 pr-2">
                        <input
                          type="checkbox"
                          checked={
                            sortedAssessments.length > 0 &&
                            selectedIds.size === sortedAssessments.length
                          }
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--brand-green)] focus:ring-[var(--brand-green)]"
                          aria-label="Select all rows"
                        />
                      </th>
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
                          i % 2 === 0 ? "bg-muted/30" : ""
                        }`}
                      >
                        <td className="w-10 py-3 pr-2 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(a.id)}
                            onChange={() => toggleSelect(a.id)}
                            className="h-4 w-4 rounded border-gray-300 text-[var(--brand-green)] focus:ring-[var(--brand-green)]"
                            aria-label={`Select ${a.company_name}`}
                          />
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {a.company_name}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          {a.full_name}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.title ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.email}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.product_category ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-foreground">
                          {a.overall_score != null
                            ? `${toPercentageScore(a.overall_score)}/100`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 align-middle">
                          <div className="flex min-h-[2rem] items-center justify-center">
                            {a.readiness_tier ? (
                              <TierBadge
                                tier={
                                  TIER_LABELS[
                                    a.readiness_tier as ReadinessTier
                                  ] ?? a.readiness_tier
                                }
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Incomplete
                              </span>
                            )}
                          </div>
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
                            {a.readiness_tier && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={`/assessment/results/${a.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "single",
                                  id: a.id,
                                  companyName: a.company_name ?? "this company",
                                })
                              }
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                              aria-label={`Delete assessment for ${a.company_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedAssessments.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
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

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => !deleting && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--brand-dark)]">
              Delete assessment{deleteConfirm?.type === "bulk" ? "s" : ""}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteConfirm?.type === "single"
              ? `Are you sure you want to delete this assessment for ${deleteConfirm.companyName}? This cannot be undone.`
              : deleteConfirm?.type === "bulk"
                ? `Are you sure you want to delete ${deleteConfirm.count} assessment(s)? This cannot be undone.`
                : ""}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
              onClick={() => {
                if (!deleteConfirm) return;
                if (deleteConfirm.type === "single") {
                  handleDeleteSingle(deleteConfirm.id);
                } else {
                  handleDeleteBulk(Array.from(selectedIds));
                }
              }}
            >
              {deleting ? "Deleting…" : deleteConfirm?.type === "bulk" ? "Delete Selected" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium text-foreground">
                      {selectedAssessment.title ?? "N/A"}
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
                      {selectedAssessment.phone ?? "N/A"}
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

                {selectedAssessment.overall_score !== null && (
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-[var(--brand-dark)]">
                      {toPercentageScore(selectedAssessment.overall_score)}/100
                    </div>
                    {selectedAssessment.readiness_tier && (
                      <TierBadge
                        tier={
                          TIER_LABELS[
                            selectedAssessment.readiness_tier as ReadinessTier
                          ] ?? selectedAssessment.readiness_tier
                        }
                      />
                    )}
                  </div>
                )}

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
                        score={buildSectionScores(selectedAssessment)[section.id] ?? 0}
                        max={25}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePdf(selectedAssessment.id, "view")}
                    disabled={pdfLoadingId === selectedAssessment.id}
                  >
                    {pdfLoadingId === selectedAssessment.id
                      ? "Loading…"
                      : "View PDF"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePdf(selectedAssessment.id, "download")}
                    disabled={pdfLoadingId === selectedAssessment.id}
                  >
                    Download PDF
                  </Button>
                  {selectedAssessment.readiness_tier && (
                    <Button
                      className="bg-[var(--brand-green)] font-semibold text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90"
                      size="sm"
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
