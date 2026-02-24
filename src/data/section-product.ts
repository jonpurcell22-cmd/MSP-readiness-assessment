import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionProductConfig: AssessmentSectionConfig = {
  sectionKey: "section1",
  sectionNumber: 1,
  title: "MSP-Ready Product Architecture",
  description:
    "MSPs manage dozens or hundreds of clients. If your product can't handle that operational reality, nothing else matters.",
  questions: [
    {
      name: "Multi-Tenant Management",
      context:
        "MSPs need to manage all their clients from one place. Logging into separate instances per client is a dealbreaker.",
      questionKey: "q1",
      options: [
        {
          score: 1,
          shortLabel: "Single-tenant only, separate instance per client",
          fullDescription:
            "Single-tenant only, separate instance per client. MSPs would need to log in to a different instance for each client.",
        },
        {
          score: 2,
          shortLabel: "Basic multi-client view, limited, no isolation or RBAC",
          fullDescription:
            "Basic multi-client view, limited, no isolation or RBAC. Some visibility across clients but not true multi-tenancy.",
        },
        {
          score: 3,
          shortLabel:
            "Multi-tenant console with basic separation, missing delegated admin or per-client policies",
          fullDescription:
            "Multi-tenant console with basic separation, missing delegated admin or per-client policies. Getting there but gaps remain.",
        },
        {
          score: 4,
          shortLabel:
            "Strong multi-tenant with isolation, RBAC, per-client config, minor gaps",
          fullDescription:
            "Strong multi-tenant with isolation, RBAC, per-client config, minor gaps. MSPs can operate at scale with small workarounds.",
        },
        {
          score: 5,
          shortLabel:
            "Full multi-tenant platform: hierarchical management, delegated admin, per-client policies, bulk operations",
          fullDescription:
            "Full multi-tenant platform: hierarchical management, delegated admin, per-client policies, bulk operations. Built for MSP operational reality.",
        },
      ],
    },
    {
      name: "API & Integration Depth",
      context:
        "MSPs run their business through PSA and RMM platforms. If your product doesn't connect to their operational backbone, it stays on the shelf.",
      questionKey: "q2",
      options: [
        {
          score: 1,
          shortLabel: "No public API, no PSA/RMM integrations",
          fullDescription:
            "No public API, no PSA/RMM integrations. Product operates in isolation from MSP tools.",
        },
        {
          score: 2,
          shortLabel: "Basic API (read-only or limited), no PSA/RMM integrations",
          fullDescription:
            "Basic API (read-only or limited), no PSA/RMM integrations. Some programmability but not connected to MSP stack.",
        },
        {
          score: 3,
          shortLabel:
            "Functional API with key endpoints, one or two non-native integrations",
          fullDescription:
            "Functional API with key endpoints, one or two non-native integrations. MSPs can build something but it's not native.",
        },
        {
          score: 4,
          shortLabel:
            "Well-documented API, native integrations with 2+ major PSA/RMM platforms",
          fullDescription:
            "Well-documented API, native integrations with 2+ major PSA/RMM platforms. Fits into how MSPs already work.",
        },
        {
          score: 5,
          shortLabel:
            "Comprehensive API with webhooks and automation, native integrations with 3+ PSA/RMM platforms actively used by MSPs",
          fullDescription:
            "Comprehensive API with webhooks and automation, native integrations with 3+ PSA/RMM platforms actively used by MSPs. MSPs can run their business through your product.",
        },
      ],
    },
    {
      name: "Automated Provisioning",
      context:
        "When an MSP signs a new client on Monday, they need that client live on your platform by Tuesday. Not next week.",
      questionKey: "q3",
      options: [
        {
          score: 1,
          shortLabel: "Manual setup by vendor team, days or weeks to provision",
          fullDescription:
            "Manual setup by vendor team, days or weeks to provision. Every new client is a project.",
        },
        {
          score: 2,
          shortLabel: "Partially manual, MSP needs vendor involvement to complete",
          fullDescription:
            "Partially manual, MSP needs vendor involvement to complete. MSP can start but can't finish alone.",
        },
        {
          score: 3,
          shortLabel:
            "MSP self-provisions via UI but multiple manual steps, 1-2 hours per client",
          fullDescription:
            "MSP self-provisions via UI but multiple manual steps, 1-2 hours per client. Works but doesn't scale.",
        },
        {
          score: 4,
          shortLabel:
            "Streamlined provisioning via UI or API, under 30 minutes, minimal manual steps",
          fullDescription:
            "Streamlined provisioning via UI or API, under 30 minutes, minimal manual steps. MSP can onboard clients in a single sitting.",
        },
        {
          score: 5,
          shortLabel:
            "Fully automated via API/script/one-click, minutes to provision, supports bulk",
          fullDescription:
            "Fully automated via API/script/one-click, minutes to provision, supports bulk. New client Monday morning, live by lunch.",
        },
      ],
    },
    {
      name: "White-Label / Co-Brand Capability",
      context:
        "MSPs sell their brand, not yours. If every touchpoint carries your logo, the MSP is training their client to buy direct.",
      questionKey: "q4",
      options: [
        {
          score: 1,
          shortLabel: "No customization, all surfaces carry vendor brand",
          fullDescription:
            "No customization, all surfaces carry vendor brand. MSPs are advertising your company to their clients.",
        },
        {
          score: 2,
          shortLabel: "Minor customization (one logo placement), vendor brand dominates",
          fullDescription:
            "Minor customization (one logo placement), vendor brand dominates. Token gesture, not real white-label.",
        },
        {
          score: 3,
          shortLabel:
            "Partial white-label on some elements, vendor brand still visible in key areas",
          fullDescription:
            "Partial white-label on some elements, vendor brand still visible in key areas. Mixed experience.",
        },
        {
          score: 4,
          shortLabel:
            "Strong co-brand across most client-facing surfaces, powered by treatment",
          fullDescription:
            "Strong co-brand across most client-facing surfaces, powered by treatment. MSP brand leads, yours in the fine print.",
        },
        {
          score: 5,
          shortLabel:
            "Full white-label: custom domains, branded portals, reports, and emails",
          fullDescription:
            "Full white-label: custom domains, branded portals, reports, and emails. Client may never know who powers it.",
        },
      ],
    },
    {
      name: "Client Reporting & Value Demonstration",
      context:
        "MSPs justify their monthly fee by showing clients the value delivered. If they can't pull a report that proves it, your product becomes hard to defend at renewal.",
      questionKey: "q5",
      options: [
        {
          score: 1,
          shortLabel: "No client-facing reporting, MSPs build reports manually",
          fullDescription:
            "No client-facing reporting, MSPs build reports manually. Huge effort to prove value.",
        },
        {
          score: 2,
          shortLabel:
            "Basic reporting exists but not MSP-designed, no per-client breakdown",
          fullDescription:
            "Basic reporting exists but not MSP-designed, no per-client breakdown. MSPs adapt what's there.",
        },
        {
          score: 3,
          shortLabel:
            "Per-client reports with relevant metrics, limited customization, no scheduled delivery",
          fullDescription:
            "Per-client reports with relevant metrics, limited customization, no scheduled delivery. Useful but manual.",
        },
        {
          score: 4,
          shortLabel:
            "Good reporting with per-client breakdowns, multiple formats, some branding, scheduled delivery",
          fullDescription:
            "Good reporting with per-client breakdowns, multiple formats, some branding, scheduled delivery. MSPs can run renewals with confidence.",
        },
        {
          score: 5,
          shortLabel:
            "MSP-optimized: full customization, white-label, scheduled delivery, executive summaries, trend analysis for upselling",
          fullDescription:
            "MSP-optimized: full customization, white-label, scheduled delivery, executive summaries, trend analysis for upselling. Reporting becomes a revenue driver.",
        },
      ],
    },
  ],
};
