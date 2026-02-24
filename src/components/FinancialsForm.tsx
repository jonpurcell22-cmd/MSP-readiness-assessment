"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store";
import type { ExistingMspRelationships } from "@/types/assessment";

const EXISTING_MSP_OPTIONS: { value: ExistingMspRelationships; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

function parseCurrency(value: string): number | null {
  const cleaned = value.replace(/[,$\s]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialsForm() {
  const router = useRouter();
  const financials = useAssessmentStore((s) => s.financials);
  const setFinancials = useAssessmentStore((s) => s.setFinancials);
  const setComputed = useAssessmentStore((s) => s.setComputed);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [arrInput, setArrInput] = useState(
    financials.arr != null ? formatCurrency(financials.arr) : ""
  );
  const [acvInput, setAcvInput] = useState(
    financials.acv != null ? formatCurrency(financials.acv) : ""
  );
  const [customerCountInput, setCustomerCountInput] = useState(
    financials.customerCount != null ? String(financials.customerCount) : ""
  );
  const [cacInput, setCacInput] = useState(
    financials.cac != null ? formatCurrency(financials.cac) : ""
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    const arr = parseCurrency(arrInput);
    const acv = parseCurrency(acvInput);
    const customers = customerCountInput.trim() ? parseInt(customerCountInput.trim(), 10) : null;
    if (arr === null || (typeof arr === "number" && arr <= 0)) {
      next.arr = "Enter a valid ARR (e.g. 1000000)";
    }
    if (acv === null || (typeof acv === "number" && acv <= 0)) {
      next.acv = "Enter a valid ACV (e.g. 5000)";
    }
    if (customers === null || !Number.isInteger(customers) || customers < 0) {
      next.customerCount = "Enter number of customers";
    }
    if (financials.existingMspRelationships === null || financials.existingMspRelationships === undefined) {
      next.existingMspRelationships = "Please select an option";
    }
    const salesCycle = financials.salesCycleDays;
    if (salesCycle != null && (salesCycle < 0 || !Number.isInteger(salesCycle))) {
      next.salesCycleDays = "Enter a valid number of days";
    }
    const cac = cacInput.trim() ? parseCurrency(cacInput) : null;
    if (cacInput.trim() && (cac === null || (typeof cac === "number" && cac < 0))) {
      next.cac = "Enter a valid CAC";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const arr = parseCurrency(arrInput) ?? 0;
    const acv = parseCurrency(acvInput) ?? 0;
    const customerCount = parseInt(customerCountInput.trim(), 10) || 0;
    let cac: number | null = cacInput.trim() ? parseCurrency(cacInput) : null;
    if (cac === null && arr > 0 && customerCount > 0) {
      const benchmark = (arr * 0.15) / customerCount;
      cac = Math.max(5000, Math.round(benchmark));
    }

    setFinancials({
      arr,
      acv,
      customerCount,
      directRevenuePct: financials.directRevenuePct,
      salesCycleDays: financials.salesCycleDays ?? 45,
      cac,
      existingMspRelationships: financials.existingMspRelationships ?? "not_sure",
    });
    setComputed();
    router.push("/assessment/results");
  }

  const inputBase =
    "w-full rounded-lg border bg-white px-4 py-3 text-[#1B3A5C] placeholder:text-gray-400 focus:border-[#1A8A7D] focus:outline-none focus:ring-1 focus:ring-[#1A8A7D]";
  const inputError = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const labelBase = "mb-1.5 block text-sm font-medium text-[#1B3A5C]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="arr" className={labelBase}>
          Current Annual Recurring Revenue (ARR) in USD <span className="text-red-500">*</span>
        </label>
        <input
          id="arr"
          type="text"
          inputMode="decimal"
          value={arrInput}
          onChange={(e) => setArrInput(e.target.value.replace(/[^0-9,]/g, ""))}
          onBlur={() => {
            const n = parseCurrency(arrInput);
            if (n !== null) setArrInput(formatCurrency(n));
          }}
          className={`${inputBase} ${errors.arr ? inputError : "border-gray-300"}`}
          placeholder="e.g. 2,500,000"
        />
        {errors.arr && <p className="mt-1 text-sm text-red-500">{errors.arr}</p>}
      </div>

      <div>
        <label htmlFor="acv" className={labelBase}>
          Average Contract Value (ACV) per customer per year in USD <span className="text-red-500">*</span>
        </label>
        <input
          id="acv"
          type="text"
          inputMode="decimal"
          value={acvInput}
          onChange={(e) => setAcvInput(e.target.value.replace(/[^0-9,]/g, ""))}
          onBlur={() => {
            const n = parseCurrency(acvInput);
            if (n !== null) setAcvInput(formatCurrency(n));
          }}
          className={`${inputBase} ${errors.acv ? inputError : "border-gray-300"}`}
          placeholder="e.g. 5,000"
        />
        {errors.acv && <p className="mt-1 text-sm text-red-500">{errors.acv}</p>}
      </div>

      <div>
        <label htmlFor="customerCount" className={labelBase}>
          Current number of customers <span className="text-red-500">*</span>
        </label>
        <input
          id="customerCount"
          type="text"
          inputMode="numeric"
          value={customerCountInput}
          onChange={(e) => setCustomerCountInput(e.target.value.replace(/\D/g, ""))}
          className={`${inputBase} ${errors.customerCount ? inputError : "border-gray-300"}`}
          placeholder="e.g. 150"
        />
        {errors.customerCount && <p className="mt-1 text-sm text-red-500">{errors.customerCount}</p>}
      </div>

      <div>
        <label className={labelBase}>
          Percentage of revenue from direct sales today
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={financials.directRevenuePct}
            onChange={(e) => setFinancials({ directRevenuePct: Number(e.target.value) })}
            className="h-2 w-full max-w-xs flex-1 accent-[#1A8A7D]"
          />
          <span className="min-w-[3rem] text-sm font-medium text-[#1B3A5C]">
            {financials.directRevenuePct}%
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="salesCycleDays" className={labelBase}>
          Average sales cycle length in days <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="salesCycleDays"
          type="number"
          min={1}
          value={financials.salesCycleDays ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setFinancials({ salesCycleDays: v === "" ? null : parseInt(v, 10) });
          }}
          className={`${inputBase} ${errors.salesCycleDays ? inputError : "border-gray-300"}`}
          placeholder="45"
        />
        {errors.salesCycleDays && <p className="mt-1 text-sm text-red-500">{errors.salesCycleDays}</p>}
      </div>

      <div>
        <label htmlFor="cac" className={labelBase}>
          Current Customer Acquisition Cost (CAC) in USD <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="cac"
          type="text"
          inputMode="decimal"
          value={cacInput}
          onChange={(e) => setCacInput(e.target.value.replace(/[^0-9,]/g, ""))}
          onBlur={() => {
            const n = parseCurrency(cacInput);
            if (n !== null) setCacInput(formatCurrency(n));
          }}
          className={`${inputBase} ${errors.cac ? inputError : "border-gray-300"}`}
          placeholder="Leave blank to use benchmark"
        />
        <p className="mt-1 text-xs text-[#1B3A5C]/60">
          Benchmark if blank: (ARR × 15%) ÷ customers, minimum $5,000
        </p>
        {errors.cac && <p className="mt-1 text-sm text-red-500">{errors.cac}</p>}
      </div>

      <div>
        <label className={labelBase}>
          Do you have any existing MSP relationships today? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {EXISTING_MSP_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition ${
                financials.existingMspRelationships === opt.value
                  ? "border-[#1A8A7D] bg-[#1A8A7D]/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="existingMsp"
                value={opt.value}
                checked={financials.existingMspRelationships === opt.value}
                onChange={() => setFinancials({ existingMspRelationships: opt.value })}
                className="sr-only"
              />
              <span className="text-sm font-medium text-[#1B3A5C]">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.existingMspRelationships && (
          <p className="mt-1 text-sm text-red-500">{errors.existingMspRelationships}</p>
        )}
      </div>

      <div className="mt-4 flex flex-row flex-wrap justify-between gap-4">
        <Link
          href="/assessment/channel-health"
          className="inline-flex items-center justify-center rounded-lg border border-[#1B3A5C]/30 bg-white px-6 py-3 font-medium text-[#1B3A5C] hover:bg-[#1B3A5C]/5"
        >
          ← Previous
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-[#1A8A7D] px-6 py-3 font-semibold text-white hover:bg-[#157a6e] focus:outline-none focus:ring-2 focus:ring-[#1A8A7D] focus:ring-offset-2"
        >
          See My Results →
        </button>
      </div>
    </form>
  );
}
