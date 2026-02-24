"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TIER_LABELS } from "@/lib/scoring";
import type { ReadinessTier } from "@/types/assessment";

interface AssessmentRow {
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
  red_flags: string[] | null;
}

const TIER_COLORS: Record<string, string> = {
  ready: "#2D8C46",
  capable: "#1A8A7D",
  emerging: "#D97706",
  premature: "#DC2626",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function exportCSV(rows: AssessmentRow[]) {
  const headers = ["Date", "Name", "Company", "Email", "Phone", "Score", "Tier"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        formatDate(r.created_at),
        `"${(r.full_name ?? "").replace(/"/g, '""')}"`,
        `"${(r.company_name ?? "").replace(/"/g, '""')}"`,
        r.email ?? "",
        r.phone ?? "",
        r.overall_score ?? "",
        TIER_LABELS[(r.readiness_tier as ReadinessTier) ?? "emerging"] ?? r.readiness_tier,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `msp-assessments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setAuthFailed(false);
    const res = await fetch("/api/admin/assessments", { credentials: "include" });
    if (res.status === 401) {
      setAuthFailed(true);
      setAssessments([]);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setAssessments(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoggingIn(false);
    if (!res.ok) {
      setLoginError(data?.error ?? "Login failed");
      return;
    }
    setPassword("");
    fetchAssessments();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthFailed(true);
    setAssessments([]);
  };

  const filtered = search.trim()
    ? assessments.filter(
        (r) =>
          r.company_name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : assessments;

  const handlePdf = async (id: string, action: "view" | "download") => {
    setPdfError(null);
    setPdfLoadingId(id);
    try {
      const res = await fetch(`/api/admin/assessments/${id}/pdf`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { error?: string })?.error ?? res.statusText;
        setPdfError(`${res.status}: ${msg}`);
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
        a.download = res.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ?? `assessment-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Failed to load PDF");
      console.error(err);
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (!authFailed && loading) {
    return (
      <main className="min-h-screen bg-[#F4F7FA] p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[#1B3A5C]/80">Loading...</p>
        </div>
      </main>
    );
  }

  if (authFailed) {
    return (
      <main className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[#1B3A5C]">Admin Login</h1>
          <p className="mt-1 text-sm text-[#1B3A5C]/70">Enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-[#1B3A5C] focus:border-[#1A8A7D] focus:outline-none focus:ring-1 focus:ring-[#1A8A7D]"
              autoFocus
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-lg bg-[#1A8A7D] py-2 font-semibold text-white hover:bg-[#157a6e] disabled:opacity-50"
            >
              {loggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#1A8A7D] hover:underline">
              ← Back to site
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#1B3A5C]">Submissions</h1>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search company or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#1B3A5C] focus:border-[#1A8A7D] focus:outline-none focus:ring-1 focus:ring-[#1A8A7D]"
            />
            <button
              type="button"
              onClick={() => exportCSV(filtered)}
              className="rounded-lg border border-[#1B3A5C]/30 bg-white px-4 py-2 text-sm font-medium text-[#1B3A5C] hover:bg-[#1B3A5C]/5"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#1B3A5C]/80 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        {pdfError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {pdfError}
            <button
              type="button"
              onClick={() => setPdfError(null)}
              className="ml-2 font-medium underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B3A5C]/5">
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Date</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Name</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Company</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Email</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Phone</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Score</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">Tier</th>
                  <th className="px-4 py-3 font-semibold text-[#1B3A5C]">PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                      className="cursor-pointer border-b border-gray-100 hover:bg-[#F4F7FA]"
                    >
                      <td className="px-4 py-3 text-[#1B3A5C]/90">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-[#1B3A5C]">{row.full_name}</td>
                      <td className="px-4 py-3 text-[#1B3A5C]">{row.company_name}</td>
                      <td className="px-4 py-3 text-[#1B3A5C]">{row.email}</td>
                      <td className="px-4 py-3 text-[#1B3A5C]">{row.phone}</td>
                      <td className="px-4 py-3 text-[#1B3A5C]">{row.overall_score ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              TIER_COLORS[row.readiness_tier ?? ""] ?? "#6B7280",
                          }}
                        >
                          {TIER_LABELS[(row.readiness_tier as ReadinessTier) ?? "emerging"] ?? row.readiness_tier ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/admin/assessments/${row.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border border-[#1B3A5C]/30 bg-white px-2 py-1 text-xs font-medium text-[#1B3A5C] hover:bg-[#1B3A5C]/5"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handlePdf(row.id, "download")}
                            disabled={pdfLoadingId === row.id}
                            className="rounded border border-[#1A8A7D] bg-[#1A8A7D] px-2 py-1 text-xs font-medium text-white hover:bg-[#157a6e] disabled:opacity-50"
                          >
                            {pdfLoadingId === row.id ? "…" : "Download"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr className="bg-[#F4F7FA]">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <h3 className="mb-2 font-semibold text-[#1B3A5C]">Contact</h3>
                              <ul className="space-y-1 text-sm text-[#1B3A5C]/90">
                                <li>Title: {row.title}</li>
                                <li>Website: {row.company_website || "—"}</li>
                                <li>Product category: {row.product_category}</li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="mb-2 font-semibold text-[#1B3A5C]">Financials</h3>
                              <ul className="space-y-1 text-sm text-[#1B3A5C]/90">
                                <li>ARR: {row.arr != null ? `$${Number(row.arr).toLocaleString()}` : "—"}</li>
                                <li>ACV: {row.acv != null ? `$${Number(row.acv).toLocaleString()}` : "—"}</li>
                                <li>Customers: {row.customer_count ?? "—"}</li>
                                <li>Direct revenue %: {row.direct_revenue_pct ?? "—"}</li>
                                <li>Sales cycle (days): {row.sales_cycle_days ?? "—"}</li>
                                <li>CAC: {row.cac != null ? `$${Number(row.cac).toLocaleString()}` : "—"}</li>
                                <li>Existing MSP: {row.existing_msp_relationships ?? "—"}</li>
                              </ul>
                            </div>
                            <div className="sm:col-span-2">
                              <h3 className="mb-2 font-semibold text-[#1B3A5C]">Section scores</h3>
                              <p className="text-sm text-[#1B3A5C]/90">
                                Product: {row.section_1_total ?? "—"}/25 · Pricing: {row.section_2_total ?? "—"}/25 ·
                                Organization: {row.section_3_total ?? "—"}/25 · Ecosystem: {row.section_4_total ?? "—"}/25 ·
                                Enablement: {row.section_5_total ?? "—"}/25 · Competitive: {row.section_6_total ?? "—"}/25
                                {row.section_7_skipped ? " · Channel health: Skipped" : ` · Channel health: ${row.section_7_total ?? "—"}/25`}
                              </p>
                            </div>
                            {row.red_flags && row.red_flags.length > 0 && (
                              <div className="sm:col-span-2">
                                <h3 className="mb-2 font-semibold text-[#1B3A5C]">Red flags</h3>
                                <ul className="list-inside list-disc space-y-1 text-sm text-[#1B3A5C]/90">
                                  {row.red_flags.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="sm:col-span-2 flex justify-end">
                              <a
                                href={`/api/admin/assessments/${row.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded border border-[#1B3A5C]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#1B3A5C] hover:bg-[#1B3A5C]/5"
                              >
                                View full PDF
                              </a>
                              <button
                                type="button"
                                onClick={() => handlePdf(row.id, "download")}
                                disabled={pdfLoadingId === row.id}
                                className="ml-2 rounded bg-[#1A8A7D] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#157a6e] disabled:opacity-50"
                              >
                                {pdfLoadingId === row.id ? "Loading…" : "Download PDF"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-[#1B3A5C]/70">No submissions yet.</p>
          )}
        </div>

        <p className="mt-4">
          <Link href="/" className="text-sm text-[#1A8A7D] hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
