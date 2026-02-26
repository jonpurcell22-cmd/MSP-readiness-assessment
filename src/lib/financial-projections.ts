/**
 * Financial projections for the results-by-id page.
 * Compatible with mock/legacy assessment payloads (current_arr, avg_contract_value, etc.).
 */

export interface FinancialInputs {
  current_arr?: number;
  avg_contract_value?: number;
  estimated_cac?: number;
  annual_new_customers?: number;
}

export interface ProjectionYear {
  revenue: number;
  partners: number;
  totalClients: number;
}

export interface ProjectionsResult {
  year1: ProjectionYear;
  year2: ProjectionYear;
  year3: ProjectionYear;
}

const DEFAULT_ACV = 12_000;
const DEFAULT_CAC = 5_000;
const PARTNERS_Y1 = 6;
const PARTNERS_Y2 = 12;
const PARTNERS_Y3 = 20;
const CLIENTS_PER_PARTNER_Y1 = 5;
const CLIENTS_PER_PARTNER_Y2 = 10;
const CLIENTS_PER_PARTNER_Y3 = 15;

/**
 * Simple 3-year MSP channel revenue projection based on readiness score (scale factor).
 */
export function calculateProjections(
  inputs: FinancialInputs,
  totalScore: number
): ProjectionsResult {
  const acv = inputs.avg_contract_value ?? DEFAULT_ACV;
  const scoreFactor = Math.max(0.3, Math.min(1, totalScore / 100));

  const y1Clients = PARTNERS_Y1 * CLIENTS_PER_PARTNER_Y1;
  const y2Clients = PARTNERS_Y2 * CLIENTS_PER_PARTNER_Y2;
  const y3Clients = PARTNERS_Y3 * CLIENTS_PER_PARTNER_Y3;

  return {
    year1: {
      revenue: Math.round(y1Clients * acv * scoreFactor),
      partners: PARTNERS_Y1,
      totalClients: y1Clients,
    },
    year2: {
      revenue: Math.round(y2Clients * acv * scoreFactor),
      partners: PARTNERS_Y2,
      totalClients: y2Clients,
    },
    year3: {
      revenue: Math.round(y3Clients * acv * scoreFactor),
      partners: PARTNERS_Y3,
      totalClients: y3Clients,
    },
  };
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}
