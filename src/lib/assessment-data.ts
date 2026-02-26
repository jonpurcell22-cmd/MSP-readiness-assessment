/**
 * Aggregated section list for the dynamic assessment/[section] page.
 * Built from existing section configs; keeps one source of truth (section-*.ts).
 */

import { sectionProductConfig } from "@/data/section-product";
import { sectionPricingConfig } from "@/data/section-pricing";
import { sectionOrganizationConfig } from "@/data/section-organization";
import { sectionEcosystemConfig } from "@/data/section-ecosystem";
import { sectionEnablementConfig } from "@/data/section-enablement";
import { sectionCompetitiveConfig } from "@/data/section-competitive";
import { sectionChannelHealthConfig } from "@/data/section-channel-health";
import type { SectionKey } from "@/types/assessment";

export interface AssessmentSectionQuestionOption {
  score: number;
  label: string;
}

export interface AssessmentSectionQuestion {
  id: string;
  name: string;
  context: string;
  options: AssessmentSectionQuestionOption[];
}

export interface AssessmentSectionData {
  id: SectionKey;
  title: string;
  description: string;
  questions: AssessmentSectionQuestion[];
}

const configs = [
  sectionProductConfig,
  sectionPricingConfig,
  sectionOrganizationConfig,
  sectionEcosystemConfig,
  sectionEnablementConfig,
  sectionCompetitiveConfig,
  sectionChannelHealthConfig,
];

function toSectionData(config: (typeof configs)[0]): AssessmentSectionData {
  return {
    id: config.sectionKey,
    title: config.title,
    description: config.description,
    questions: config.questions.map((q) => ({
      id: q.questionKey,
      name: q.name,
      context: q.context,
      options: q.options.map((o) => ({ score: o.score, label: o.shortLabel })),
    })),
  };
}

export const sections: AssessmentSectionData[] = configs.map(toSectionData);
