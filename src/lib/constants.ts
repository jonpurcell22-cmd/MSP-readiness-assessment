import type { TitleOption, ProductCategory } from "@/types/assessment";

/** Assessment section routes in order (Section 1-7). Used for prev/next links. */
export const ASSESSMENT_SECTION_ROUTES = [
  "/assessment/product",
  "/assessment/pricing",
  "/assessment/organization",
  "/assessment/ecosystem",
  "/assessment/enablement",
  "/assessment/competitive",
  "/assessment/channel-health",
] as const;

export const TITLE_OPTIONS: { value: TitleOption; label: string }[] = [
  { value: "CEO/Founder", label: "CEO / Founder" },
  { value: "CRO", label: "CRO" },
  { value: "VP of Sales", label: "VP of Sales" },
  { value: "VP/Head of Partnerships", label: "VP / Head of Partnerships" },
  { value: "Other", label: "Other" },
];

export const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Backup & DR", label: "Backup & DR" },
  { value: "Compliance / GRC", label: "Compliance / GRC" },
  { value: "Identity / IAM", label: "Identity / IAM" },
  { value: "IT Operations", label: "IT Operations" },
  { value: "SaaS Management", label: "SaaS Management" },
  { value: "Email Security", label: "Email Security" },
  { value: "Other", label: "Other" },
];
