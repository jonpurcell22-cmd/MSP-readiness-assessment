/**
 * MSP Channel Readiness Assessment - Global state (Zustand)
 * Contact info, financial data, all 7 section scores, and computed results.
 */

import { create } from "zustand";
import type {
  AssessmentState,
  ContactInfo,
  FinancialData,
  SectionScores,
  TitleOption,
  ProductCategory,
  ExistingMspRelationships,
} from "@/types/assessment";
import { computeResults } from "@/lib/scoring";

const defaultContact: ContactInfo = {
  fullName: "",
  email: "",
  phone: "",
  title: "",
  companyName: "",
  companyWebsite: "",
  productCategory: "",
};

const defaultFinancials: FinancialData = {
  arr: null,
  acv: null,
  customerCount: null,
  directRevenuePct: 100,
  salesCycleDays: 45,
  cac: null,
  existingMspRelationships: null,
};

const emptySection: SectionScores = {
  q1: 0,
  q2: 0,
  q3: 0,
  q4: 0,
  q5: 0,
};

interface AssessmentStore extends AssessmentState {
  setContact: (contact: Partial<ContactInfo>) => void;
  setFinancials: (financials: Partial<FinancialData>) => void;
  setSectionScores: (
    section: keyof Pick<
      AssessmentState,
      "section1" | "section2" | "section3" | "section4" | "section5" | "section6" | "section7"
    >,
    scores: Partial<SectionScores>
  ) => void;
  setSection7Skipped: (skipped: boolean) => void;
  setComputed: () => void;
  reset: () => void;
}

const getInitialState = (): AssessmentState => ({
  contact: { ...defaultContact },
  financials: { ...defaultFinancials },
  section1: null,
  section2: null,
  section3: null,
  section4: null,
  section5: null,
  section6: null,
  section7: null,
  section7Skipped: null,
  computed: null,
});

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  ...getInitialState(),

  setContact: (contact) =>
    set((state) => ({
      contact: { ...state.contact, ...contact },
    })),

  setFinancials: (financials) =>
    set((state) => ({
      financials: { ...state.financials, ...financials },
    })),

  setSectionScores: (section, scores) =>
    set((state) => {
      const current = state[section] ?? { ...emptySection };
      const next: SectionScores = { ...current, ...scores };
      return { [section]: next };
    }),

  setSection7Skipped: (skipped) =>
    set({ section7Skipped: skipped }),

  setComputed: () =>
    set((state) => {
      const computed = computeResults(state as AssessmentState);
      return { computed: computed ?? null };
    }),

  reset: () => set(getInitialState()),
}));
