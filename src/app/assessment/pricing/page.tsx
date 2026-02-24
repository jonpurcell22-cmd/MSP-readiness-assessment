import { AssessmentSection } from "@/components/AssessmentSection";
import { sectionPricingConfig } from "@/data/section-pricing";

export default function AssessmentPricingPage() {
  return <AssessmentSection config={sectionPricingConfig} />;
}
