import { AssessmentSection } from "@/components/AssessmentSectionPage";
import { sectionPricingConfig } from "@/data/section-pricing";

export default function AssessmentPricingPage() {
  return <AssessmentSection config={sectionPricingConfig} />;
}
