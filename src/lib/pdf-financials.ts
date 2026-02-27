/**
 * Deterministic financial projections and cost-of-delay for the PDF report.
 * Matches FINANCIAL IMPACT MODELING in the spec.
 */

export interface FinancialInputs {
  arr: number | null;
  acv: number | null;
  customerCount: number | null;
  cac: number | null;
  salesCycleDays: number | null;
}

export interface ThreeYearProjection {
  year1: { partners: number; clientsPerPartner: number; totalClients: number; mspRevenue: number; mspRevenuePctArr: number };
  year2: { partners: number; clientsPerPartner: number; totalClients: number; mspRevenue: number; mspRevenuePctArr: number };
  year3: { partners: number; clientsPerPartner: number; totalClients: number; mspRevenue: number; mspRevenuePctArr: number };
}

const PARTNERS_Y1 = 6;
const PARTNERS_Y2 = 12;
const PARTNERS_Y3 = 20;
const CLIENTS_PER_PARTNER_Y1 = 5;
const CLIENTS_PER_PARTNER_Y2 = 10;
const CLIENTS_PER_PARTNER_Y3 = 15;

export function getThreeYearProjection(inputs: FinancialInputs): ThreeYearProjection | null {
  const arr = inputs.arr ?? 0;
  const acv = inputs.acv ?? 0;
  if (arr <= 0 || acv <= 0) return null;

  const y1Clients = PARTNERS_Y1 * CLIENTS_PER_PARTNER_Y1;
  const y2Clients = PARTNERS_Y2 * CLIENTS_PER_PARTNER_Y2;
  const y3Clients = PARTNERS_Y3 * CLIENTS_PER_PARTNER_Y3;
  const y1Revenue = y1Clients * acv;
  const y2Revenue = y2Clients * acv;
  const y3Revenue = y3Clients * acv;

  return {
    year1: {
      partners: PARTNERS_Y1,
      clientsPerPartner: CLIENTS_PER_PARTNER_Y1,
      totalClients: y1Clients,
      mspRevenue: y1Revenue,
      mspRevenuePctArr: arr > 0 ? (y1Revenue / arr) * 100 : 0,
    },
    year2: {
      partners: PARTNERS_Y2,
      clientsPerPartner: CLIENTS_PER_PARTNER_Y2,
      totalClients: y2Clients,
      mspRevenue: y2Revenue,
      mspRevenuePctArr: arr > 0 ? (y2Revenue / arr) * 100 : 0,
    },
    year3: {
      partners: PARTNERS_Y3,
      clientsPerPartner: CLIENTS_PER_PARTNER_Y3,
      totalClients: y3Clients,
      mspRevenue: y3Revenue,
      mspRevenuePctArr: arr > 0 ? (y3Revenue / arr) * 100 : 0,
    },
  };
}

/** Quarterly new customers (direct): (ARR * 0.25) / ACV / 4. CAC savings per quarter = that * (direct CAC * 0.5). */
export function getCostOfDelay(inputs: FinancialInputs): {
  quarterlyNewCustomers: number;
  cacSavingsPerQuarter: number;
  year1MspRevenueLost: number;
} | null {
  const arr = inputs.arr ?? 0;
  const acv = inputs.acv ?? 0;
  const customerCount = inputs.customerCount ?? 0;
  const rawCac = inputs.cac;
  const cac =
    rawCac ??
    (customerCount > 0 && arr > 0 ? Math.max(5000, (arr * 0.15) / customerCount) : 5000);
  if (arr <= 0 || acv <= 0) return null;

  const quarterlyNewCustomers = (arr * 0.25) / acv / 4;
  const cacSavingsPerQuarter = quarterlyNewCustomers * (cac * 0.5);
  const y1Clients = PARTNERS_Y1 * CLIENTS_PER_PARTNER_Y1;
  const year1MspRevenueLost = y1Clients * acv;

  return {
    quarterlyNewCustomers: Math.round(quarterlyNewCustomers),
    cacSavingsPerQuarter: Math.round(cacSavingsPerQuarter),
    year1MspRevenueLost,
  };
}

/**
 * DIY vs Expert-Guided build estimates for results page (aligned with PDF narrative).
 * Ranges from spec: DIY $500K-$900K over 18-24 months; Expert $60K-$200K over 6-9 months.
 */
export interface DiyExpertEstimate {
  cost: number;
  timeMonths: number;
  risk: string;
}

export function getDiyExpertEstimates(): {
  diy: DiyExpertEstimate;
  expert: DiyExpertEstimate;
} {
  return {
    diy: {
      cost: 700_000, // midpoint of $500K-$900K
      timeMonths: 21, // midpoint of 18-24
      risk: "VP/Director hire + 1-2 channel managers; time to productivity 6-9 months. Revenue starts month 15-18.",
    },
    expert: {
      cost: 130_000, // midpoint of $60K-$200K
      timeMonths: 8, // midpoint of 6-9
      risk: "Launch-ready playbook; revenue 6-9 months sooner. Internal hire still needed but avoids 12-month learning curve.",
    },
  };
}

/** Format dollar amounts with comma separators (e.g. $125,000, $50,000,000). */
export function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;
}
