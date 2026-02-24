import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionChannelHealthConfig: AssessmentSectionConfig = {
  sectionKey: "section7",
  sectionNumber: 7,
  title: "Existing MSP Channel Health",
  description: "If you already have MSP partners, this section matters. If not, skip it and we'll adjust your score.",
  questions: [
    {
      name: "Partner Activation Rate",
      context: "Signed partners who never deploy are dead weight. Activation rate tells you whether onboarding and enablement are working.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "Under 20% of signed partners deployed with even one client", fullDescription: "Under 20% of signed partners deployed with even one client. Most never activate." },
        { score: 2, shortLabel: "20-35% activation, handful active, most signed up and never engaged", fullDescription: "20-35% activation, handful active, most signed up and never engaged. Leaky funnel." },
        { score: 3, shortLabel: "35-50% activation, roughly half producing, long tail of inactive", fullDescription: "35-50% activation, roughly half producing, long tail of inactive. Room to improve." },
        { score: 4, shortLabel: "50-70% activation, majority deploying, clear success patterns", fullDescription: "50-70% activation, majority deploying, clear success patterns. Onboarding works." },
        { score: 5, shortLabel: "70%+ activation, strong onboarding-to-activation pipeline with success data", fullDescription: "70%+ activation, strong onboarding-to-activation pipeline with success data. Best-in-class activation." },
      ],
    },
    {
      name: "Revenue Concentration",
      context: "If 80% of partner revenue comes from 2 partners, you don't have a program. You have 2 relationships.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "Revenue concentrated in 1-2 partners, if they leave the program collapses", fullDescription: "Revenue concentrated in 1-2 partners, if they leave the program collapses. Not a program." },
        { score: 2, shortLabel: "Top 3-5 partners generate 70%+ of revenue, high concentration risk", fullDescription: "Top 3-5 partners generate 70%+ of revenue, high concentration risk. Fragile." },
        { score: 3, shortLabel: "Somewhat distributed, top 10 account for most revenue, growing middle tier", fullDescription: "Somewhat distributed, top 10 account for most revenue, growing middle tier. Improving." },
        { score: 4, shortLabel: "Healthy distribution, no single partner over 15%, strong middle tier", fullDescription: "Healthy distribution, no single partner over 15%, strong middle tier. Resilient." },
        { score: 5, shortLabel: "Well-distributed across broad base, multiple tiers contributing, losing one partner is immaterial", fullDescription: "Well-distributed across broad base, multiple tiers contributing, losing one partner is immaterial. Mature program." },
      ],
    },
    {
      name: "Partner Retention",
      context: "Annual churn above 25% means you're refilling a leaky bucket.",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "Annual churn above 40%, partners leave due to product, pricing, or support", fullDescription: "Annual churn above 40%, partners leave due to product, pricing, or support. Critical issue." },
        { score: 2, shortLabel: "25-40% churn, mixed reasons, no formal retention strategy", fullDescription: "25-40% churn, mixed reasons, no formal retention strategy. Leaky bucket." },
        { score: 3, shortLabel: "15-25% churn, some understanding of why, beginning retention tactics", fullDescription: "15-25% churn, some understanding of why, beginning retention tactics. Getting a handle." },
        { score: 4, shortLabel: "10-15% churn, clear understanding of drivers, active retention with QBRs", fullDescription: "10-15% churn, clear understanding of drivers, active retention with QBRs. Managed retention." },
        { score: 5, shortLabel: "Under 10% churn, partners loyal and growing, strong satisfaction, churn rare and due to partner business changes", fullDescription: "Under 10% churn, partners loyal and growing, strong satisfaction, churn rare and due to partner business changes. Loyal base." },
      ],
    },
    {
      name: "Time to First Client Deployment",
      context: "The faster a new partner gets their first client on your platform, the more likely they become a long-term productive partner.",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "6+ months average to first client, most stall during onboarding", fullDescription: "6+ months average to first client, most stall during onboarding. Too slow." },
        { score: 2, shortLabel: "3-6 months, significant hand-holding needed", fullDescription: "3-6 months, significant hand-holding needed. Resource intensive." },
        { score: 3, shortLabel: "1-3 months, onboarding works but could be faster", fullDescription: "1-3 months, onboarding works but could be faster. Acceptable." },
        { score: 4, shortLabel: "Under 30 days for most partners, clear path with milestones", fullDescription: "Under 30 days for most partners, clear path with milestones. Strong onboarding." },
        { score: 5, shortLabel: "Under 14 days, self-serve onboarding, first deployment is a repeatable process", fullDescription: "Under 14 days, self-serve onboarding, first deployment is a repeatable process. Best-in-class." },
      ],
    },
    {
      name: "Partner Satisfaction & Advocacy",
      context: "Happy partners recruit other partners. Unhappy partners warn the community. Word-of-mouth is the most powerful force in MSP partner recruitment.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "No formal measurement, anecdotally frustrated/disengaged, negative word-of-mouth", fullDescription: "No formal measurement, anecdotally frustrated/disengaged, negative word-of-mouth. Reputation risk." },
        { score: 2, shortLabel: "No formal NPS, mixed signals, some happy, some vocal about problems", fullDescription: "No formal NPS, mixed signals, some happy, some vocal about problems. Unclear picture." },
        { score: 3, shortLabel: "Some satisfaction data (informal surveys/QBR feedback), average results, neutral", fullDescription: "Some satisfaction data (informal surveys/QBR feedback), average results, neutral. Room to improve." },
        { score: 4, shortLabel: "Formal partner NPS (30+), some actively refer others", fullDescription: "Formal partner NPS (30+), some actively refer others. Advocates emerging." },
        { score: 5, shortLabel: "High NPS (50+), vocal advocates, refer MSPs, participate in case studies, serve on advisory board", fullDescription: "High NPS (50+), vocal advocates, refer MSPs, participate in case studies, serve on advisory board. Partner-led growth." },
      ],
    },
  ],
};
