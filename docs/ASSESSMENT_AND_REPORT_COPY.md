# MSP Assessment & Report — Editable Copy


Use this document to fine-tune all user-facing text. Each section notes where the copy lives in the codebase so you can apply edits back into the app.


---


## 1. Landing Page (`src/app/page.tsx`)


**Headline**
- Is Your Company Ready For An MSP Channel?


**Subhead**
- Find out in 10 minutes. Get a personalized readiness score and financial impact analysis.


**Intro paragraph**
- MSPs control access to millions of customers. This assessment evaluates your product, pricing, organization, and competitive position against the 7 dimensions that determine whether an MSP program is set up for success or failure. 


---


## 2. Lead Capture Form (`src/components/LeadCaptureForm.tsx`, `src/lib/constants.ts`)


**Labels**
- Full Name *
- Email Address *
- Phone Number *
- Title *
- Company Name *
- Company Website (optional)
- Product Category *


**Placeholders**
- Jane Smith
- jane@company.com
- (555) 123-4567
- Select One
- Acme Inc.
- https://acme.com


**Button**
- Start Assessment →


**Title dropdown** (`src/lib/constants.ts` TITLE_OPTIONS)
- CEO / Founder
- CRO
- VP of Sales
- VP / Head of Partnerships
- Other


**Product category dropdown** (`src/lib/constants.ts` PRODUCT_CATEGORY_OPTIONS)
- Cybersecurity
- Backup & DR
- Compliance / GRC
- Identity / IAM
- IT Operations
- SaaS Management
- Email Security
- Other


**Validation messages**
- Required
- Enter a valid email
- Enter a valid URL (e.g. https://example.com)


---


## 3. Assessment Sections — Section Headers & Questions


*Section titles and descriptions are in `src/data/section-*.ts`. Questions use: name, context, and options (shortLabel + fullDescription).*


### Section 1: MSP-Ready Product Architecture
**Description:** MSPs manage dozens or hundreds of clients. Your product must be able to handle that operational reality. 


#### Q1 — Multi-Tenant Management
**Context:** MSPs need to manage all their clients from one place. Logging into separate instances per client inhibits scale.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Single-tenant only, separate instance per client | Single-tenant only, separate instance per client. MSPs would need to log in to a different instance for each client. |
| 2 | Basic multi-client view, limited, no isolation or RBAC | Basic multi-client view, limited, no isolation or RBAC. Some visibility across clients but not true multi-tenancy. |
| 3 | Multi-tenant console with basic separation, missing delegated admin or per-client policies | Multi-tenant console with basic separation, missing delegated admin or per-client policies. Getting there but gaps remain. |
| 4 | Strong multi-tenant with isolation, RBAC, per-client config, minor gaps | Strong multi-tenant with isolation, RBAC, per-client config, minor gaps. MSPs can operate at scale with small workarounds. |
| 5 | Full multi-tenant platform: hierarchical management, delegated admin, per-client policies, bulk operations | Full multi-tenant platform: hierarchical management, delegated admin, per-client policies, bulk operations. Built for MSP operational reality. |


#### Q2 — API & Integration Depth
**Context:** Most MSPs operate their core service delivery and operations through PSA and RMM platforms. If your product doesn't connect to their operational backbone, it stays on the shelf.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No public API, no PSA/RMM integrations | No public API, no PSA/RMM integrations. Product operates in isolation from MSP tools. |
| 2 | Basic API (limited), no PSA/RMM integrations | Basic API (limited), no PSA/RMM integrations. Some programmability but not connected to MSP stack. |
| 3 | Functional API with key endpoints, one or two non-native integrations | Functional API with key endpoints, one or two non-native integrations. MSPs can build something but it's not native. |
| 4 | Well-documented API, native integrations with 2+ major PSA/RMM platforms | Well-documented API, native integrations with 2+ major PSA/RMM platforms. Fits into how MSPs already work. |
| 5 | Comprehensive API with webhooks and automation, native integrations with 3+ PSA/RMM platforms actively used by MSPs | Comprehensive API with webhooks and automation, native integrations with 3+ PSA/RMM platforms actively used by MSPs. MSPs can run their business through your product. |


#### Q3 — Automated Provisioning
**Context:** When an MSP signs a new client, they need to provision them on a reliable timeline. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Manual setup by vendor team, days or weeks to provision | Manual setup by vendor team, days or weeks to provision. Every new client is a project. |
| 2 | Partially manual, MSP needs vendor involvement to complete | Partially manual, MSP needs vendor involvement to complete. MSP can start but can't finish alone. |
| 3 | MSP self-provisions via UI but multiple manual steps, 1-2 hours per client | MSP self-provisions via UI but multiple manual steps, 1-2 hours per client. Works but doesn't scale. |
| 4 | Streamlined provisioning via UI or API, under 30 minutes, minimal manual steps | Streamlined provisioning via UI or API, under 30 minutes, minimal manual steps. MSP can onboard clients in a single sitting. |
| 5 | Fully automated via API/script/one-click, minutes to provision, supports bulk | Fully automated via API/script/one-click, minutes to provision, supports bulk. New client Monday morning, live by lunch. |


#### Q4 — White-Label / Co-Brand Capability
**Context:** MSPs build and monetize their own brand. If every client touchpoint is dominated by your logo, you risk conditioning the customer to view you as the primary provider rather than the MSP.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No customization, all surfaces carry vendor brand | No customization, all surfaces carry vendor brand. MSPs are advertising your company to their clients. |
| 2 | Minor customization (one logo placement), vendor brand dominates | Minor customization (one logo placement), vendor brand dominates. Token gesture, not real white-label. |
| 3 | Partial white-label on some elements, vendor brand still visible in key areas | Partial white-label on some elements, vendor brand still visible in key areas. Mixed experience. |
| 4 | Strong co-brand across most client-facing surfaces, powered by treatment | Strong co-brand across most client-facing surfaces, powered by treatment. MSP brand leads, yours in the fine print. |
| 5 | Full white-label: custom domains, branded portals, reports, and emails | Full white-label: custom domains, branded portals, reports, and emails. Client may never know who powers it. |


#### Q5 — Client Reporting & Value Demonstration
**Context:** MSPs earn their recurring revenue by demonstrating measurable value. If they cannot easily produce reporting that proves outcomes, your solution becomes difficult to justify at renewal.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No client-facing reporting, MSPs build reports manually | No client-facing reporting, MSPs build reports manually. Huge effort to prove value. |
| 2 | Basic reporting exists but not MSP-designed, no per-client breakdown | Basic reporting exists but not MSP-designed, no per-client breakdown. MSPs adapt what's there. |
| 3 | Per-client reports with relevant metrics, limited customization, no scheduled delivery | Per-client reports with relevant metrics, limited customization, no scheduled delivery. Useful but manual. |
| 4 | Good reporting with per-client breakdowns, multiple formats, some branding, scheduled delivery | Good reporting with per-client breakdowns, multiple formats, some branding, scheduled delivery. MSPs can run renewals with confidence. |
| 5 | MSP-optimized: full customization, white-label, scheduled delivery, executive summaries, trend analysis for upselling | MSP-optimized: full customization, white-label, scheduled delivery, executive summaries, trend analysis for upselling. Reporting becomes a revenue driver. |


---


### Section 2: Pricing & Partner Economics
**Description:** Pricing and packaging for MSPs is materially different than for direct sales. This often is a make or break for large scale success. 


#### Q1 — MSP-Friendly Pricing Structure
**Context:** Enterprise pricing (annual contracts, flat fees, minimum commitments) kills MSP economics. MSPs need per-unit pricing that flexes with their client base.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Enterprise pricing only: annual contracts, flat fees, minimums that don't flex | Enterprise pricing only: annual contracts, flat fees, minimums that don't flex. MSPs cannot scale with their client base. |
| 2 | Some per-unit element but not MSP-designed, no volume tiers or aggregate billing | Some per-unit element but not MSP-designed, no volume tiers or aggregate billing. Partial fit. |
| 3 | Per-seat/per-device pricing with some volume tiers, not optimized for MSP buying patterns | Per-seat/per-device pricing with some volume tiers, not optimized for MSP buying patterns. Workable but not ideal. |
| 4 | MSP-friendly per-unit pricing with volume tiers and aggregate pricing across MSP client base | MSP-friendly per-unit pricing with volume tiers and aggregate pricing across MSP client base. MSPs can build a practice. |
| 5 | Purpose-built MSP pricing: consumption-based, aggressive volume tiers, aggregate billing, gets cheaper as MSP scales | Purpose-built MSP pricing: consumption-based, aggressive volume tiers, aggregate billing, gets cheaper as MSP scales. Economics improve with scale. |


#### Q2 — Partner Margin Viability
**Context:** MSPs don’t always need to make a significant margin on your software, but they can’t lose money.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No partner margin structure, MSPs buy at or near retail | No partner margin structure, MSPs buy at or near retail. No room for MSP profit. |
| 2 | Under 15% discount, thin margins after MSP delivery costs | Under 15% discount, thin margins after MSP delivery costs. Hard to justify. |
| 3 | 15-25% margins, workable but not compelling for aggressive recruitment | 15-25% margins, workable but not compelling for aggressive recruitment. MSPs can make some money. |
| 4 | 25-35% margins with volume tiers, MSP can build a profitable practice | 25-35% margins with volume tiers, MSP can build a profitable practice. Solid economics. |
| 5 | 35%+ margins with transparent economics, validated with real MSP partners | 35%+ margins with transparent economics, validated with real MSP partners. MSPs actively recruit around your product. |


#### Q3 — Billing & Invoicing Flexibility
**Context:** Aggregate billing, monthly true-up, and flexible payment terms are a necessity. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Per-client billing only, no aggregate invoicing, manual adds/changes | Per-client billing only, no aggregate invoicing, manual adds/changes. Operational nightmare for MSPs. |
| 2 | Aggregate billing technically possible but clunky, mid-month changes need support tickets | Aggregate billing technically possible but clunky, mid-month changes need support tickets. Painful to use. |
| 3 | Aggregate billing available, monthly invoicing works, proration/true-up require manual steps | Aggregate billing available, monthly invoicing works, proration/true-up require manual steps. Gets the job done. |
| 4 | Clean aggregate billing with automated proration and monthly true-up, single invoice with per-client line items | Clean aggregate billing with automated proration and monthly true-up, single invoice with per-client line items. MSP-friendly. |
| 5 | Fully flexible: aggregate or per-client, monthly true-up, automated proration, API-accessible billing for MSP accounting integration | Fully flexible: aggregate or per-client, monthly true-up, automated proration, API-accessible billing for MSP accounting integration. Best-in-class. |


#### Q4 — Recurring Revenue Alignment
**Context:** MSPs build monthly recurring revenue businesses. Your pricing should make it easy to wrap your product into a predictable monthly managed service.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | One-time or annual pricing, doesn't map to monthly recurring | One-time or annual pricing, doesn't map to monthly recurring. MSPs cannot bundle into MRR. |
| 2 | Monthly billing exists but structured as monthly payment on annual contract, not true month-to-month | Monthly billing exists but structured as monthly payment on annual contract, not true month-to-month. Not true MRR. |
| 3 | True monthly recurring pricing, MSPs can mark up and resell, limited service layering opportunity | True monthly recurring pricing, MSPs can mark up and resell, limited service layering opportunity. Fits MSP model. |
| 4 | Monthly recurring designed for MSP bundling, MSPs can wrap into managed service and add value on top | Monthly recurring designed for MSP bundling, MSPs can wrap into managed service and add value on top. Built for MSPs. |
| 5 | Strong MSP recurring revenue with expansion paths: upsell tiers, add modules, layer services. Product is a platform for the MSP's practice. | Strong MSP recurring revenue with expansion paths: upsell tiers, add modules, layer services. Product is a platform for the MSP's practice. Revenue grows with the MSP. |


#### Q5 — MSP Cost to Deliver
**Context:** The easier it is to deliver your product, the easier it is to adopt by the MSP and the faster success you’ll see. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | High labor per client, significant ongoing management and vendor-assisted support | High labor per client, significant ongoing management and vendor-assisted support. Economics collapse at scale. |
| 2 | Moderate labor, dedicated time per client, not scalable past 20-30 clients | Moderate labor, dedicated time per client, not scalable past 20-30 clients. Ceiling on MSP growth. |
| 3 | Manageable effort, no dedicated per-client resources needed, some manual intervention | Manageable effort, no dedicated per-client resources needed, some manual intervention. Scales with workarounds. |
| 4 | Low effort, largely self-managing with automation/alerting, scales to 50+ clients without adding headcount | Low effort, largely self-managing with automation/alerting, scales to 50+ clients without adding headcount. Strong unit economics. |
| 5 | Minimal effort, product runs autonomously, MSP role is oversight and client communication, scales to 100+ clients per technician | Minimal effort, product runs autonomously, MSP role is oversight and client communication, scales to 100+ clients per technician. Built for MSP scale. |


---


### Section 3: Organizational & GTM Readiness
**Description:** Programs fail internally before they fail externally. This is where most vendors get it wrong.


#### Q1 — Executive Commitment
**Context:** MSP programs take 18-24 months to produce meaningful revenue. Leadership must be ready for a long-term commitment. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No executive awareness or interest, not on the roadmap | No executive awareness or interest, not on the roadmap. Program would be a side project. |
| 2 | Executive interest but viewed as experiment, no budget or timeline committed | Executive interest but viewed as experiment, no budget or timeline committed. Easy to kill. |
| 3 | Leadership supports exploring, willing to allocate some resources, but expects results in under 6 months | Leadership supports exploring, willing to allocate some resources, but expects results in under 6 months. Timeline mismatch. |
| 4 | Executive sponsor committed with 12+ month horizon, budget allocated for program development | Executive sponsor committed with 12+ month horizon, budget allocated for program development. Real commitment. |
| 5 | Board-level strategic priority with dedicated budget, headcount plan, and executive sponsor with cross-functional authority | Board-level strategic priority with dedicated budget, headcount plan, and executive sponsor with cross-functional authority. Program has staying power. |


#### Q2 — Channel Conflict Readiness
**Context:** When both a direct seller and an MSP engage the same opportunity, clear rules of engagement are essential. Without intentional design, internal friction can undermine confidence in the MSP program.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No conflict rules, direct reps compensated on all revenue including partner-sourced, no deal registration | No conflict rules, direct reps compensated on all revenue including partner-sourced, no deal registration. Partners will lose every time. |
| 2 | Topic discussed but no formal policy, direct reps would resist losing deals to partners | Topic discussed but no formal policy, direct reps would resist losing deals to partners. Conflict inevitable. |
| 3 | Basic deal registration or territory rules on paper, inconsistent enforcement, comp not adjusted | Basic deal registration or territory rules on paper, inconsistent enforcement, comp not adjusted. Paper only. |
| 4 | Formal policy with deal registration, territory boundaries, and comp adjustments that incentivize supporting partners | Formal policy with deal registration, territory boundaries, and comp adjustments that incentivize supporting partners. Designed for co-existence. |
| 5 | Fully designed: deal registration with teeth, comp multipliers for partner-sourced revenue, clear escalation, executive-backed enforcement | Fully designed: deal registration with teeth, comp multipliers for partner-sourced revenue, clear escalation, executive-backed enforcement. Direct and channel aligned. |


#### Q3 — Dedicated Channel Resources
**Context:** A partner program run as a side project by someone who also manages direct sales is likely to fail. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No one owns the partner channel, would be added to existing role | No one owns the partner channel, would be added to existing role. No ownership. |
| 2 | One person has partial responsibility, also owns other functions, no dedicated budget | One person has partial responsibility, also owns other functions, no dedicated budget. Side of desk. |
| 3 | Dedicated channel role exists (or budgeted to hire), single individual with limited budget | Dedicated channel role exists (or budgeted to hire), single individual with limited budget. A start. |
| 4 | Dedicated channel lead plus budget for MDF, events, and partner marketing, plan to scale | Dedicated channel lead plus budget for MDF, events, and partner marketing, plan to scale. Real program. |
| 5 | Channel team in place (or fully budgeted) with dedicated recruitment, enablement, and success roles, meaningful budget | Channel team in place (or fully budgeted) with dedicated recruitment, enablement, and success roles, meaningful budget. Built to scale. |


#### Q4 — Product Roadmap Responsiveness
**Context:** MSPs will surface product needs you've never heard from direct customers. Being prepared to address them is crucial. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Roadmap driven entirely by direct customer and internal priorities, no partner input mechanism | Roadmap driven entirely by direct customer and internal priorities, no partner input mechanism. Partners invisible to product. |
| 2 | Partners can submit requests but same backlog as everything else, no special priority | Partners can submit requests but same backlog as everything else, no special priority. Black hole. |
| 3 | Product team aware of MSP needs, addressed some, no formal feedback loop | Product team aware of MSP needs, addressed some, no formal feedback loop. Ad hoc. |
| 4 | MSP requirements are defined roadmap input, partner advisory board or structured feedback loop exists | MSP requirements are defined roadmap input, partner advisory board or structured feedback loop exists. Partners have a voice. |
| 5 | Product team actively prioritizes MSP features, partner advisory board meets regularly, roadmap has visible partner category | Product team actively prioritizes MSP features, partner advisory board meets regularly, roadmap has visible partner category. MSP needs are first-class. |


#### Q5 — Go-to-Market Clarity
**Context:** A defined ideal partner profile, a distinct MSP value proposition, and a clear understanding of how MSP GTM motions differ from direct.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No MSP-specific GTM thinking, we'll figure it out | No MSP-specific GTM thinking, we'll figure it out. No strategy. |
| 2 | General awareness MSPs are different from resellers, no defined ideal partner profile | General awareness MSPs are different from resellers, no defined ideal partner profile. Vague. |
| 3 | Some ideal MSP partner definition (size, geography, vertical), value prop partially differentiated | Some ideal MSP partner definition (size, geography, vertical), value prop partially differentiated. Getting there. |
| 4 | Clear ideal MSP partner profile documented, distinct value prop speaking to MSP business model | Clear ideal MSP partner profile documented, distinct value prop speaking to MSP business model. Can recruit with focus. |
| 5 | Fully developed MSP GTM: ideal partner profile, distinct value prop, defined partner journey, clear partner success metrics | Fully developed MSP GTM: ideal partner profile, distinct value prop, defined partner journey, clear partner success metrics. Ready to scale. |


---


### Section 4: Partner Ecosystem & Recruitment
**Description:** Do you have a defined ICP? Do you know what markets you want to address? 


#### Q1 — Category Demand from MSPs
**Context:** Some categories are already in every MSP's stack. Others are emerging. Where you sit determines how hard recruitment will be.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | MSPs don't deliver managed services in your category, you'd be creating a new market | MSPs don't deliver managed services in your category, you'd be creating a new market. Hardest recruitment. |
| 2 | A few forward-thinking MSPs exploring your category, not standard MSP stack yet | A few forward-thinking MSPs exploring your category, not standard MSP stack yet. Early market. |
| 3 | Growing demand, MSPs adding your category but not yet must-have | Growing demand, MSPs adding your category but not yet must-have. Momentum building. |
| 4 | Strong demand, most mid-size and large MSPs actively looking or would consider switching | Strong demand, most mid-size and large MSPs actively looking or would consider switching. Active market. |
| 5 | Core MSP stack category, every MSP needs a solution here, high switching intent | Core MSP stack category, every MSP needs a solution here, high switching intent. Must-have category. |


#### Q2 — Distributor Relationship Status
**Context:** Distribution can be a growth multiplier, but speed, structure and being prepared are necessary for success. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No distributor relationships, haven't explored it | No distributor relationships, haven't explored it. Off the highway. |
| 2 | Aware of MSP distributors but no conversations, don't meet listing requirements | Aware of MSP distributors but no conversations, don't meet listing requirements. Not ready. |
| 3 | In discussions with one or more distributors, application in progress | In discussions with one or more distributors, application in progress. On the path. |
| 4 | Listed with one MSP distributor, some MSPs transacting through marketplace | Listed with one MSP distributor, some MSPs transacting through marketplace. One lane open. |
| 5 | Listed with 2+ distributors, active transaction volume, distributor team promotes your product | Listed with 2+ distributors, active transaction volume, distributor team promotes your product. Full distribution. |


#### Q3 — MSP Community Visibility
**Context:** Do you have a presence in the MSP community yet? If not, there will be some legwork to do.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No presence in MSP communities, never attended or exhibited at MSP event | No presence in MSP communities, never attended or exhibited at MSP event. Unknown. |
| 2 | Aware of MSP communities but haven't participated, no brand recognition | Aware of MSP communities but haven't participated, no brand recognition. Invisible. |
| 3 | Some presence: 1-2 events, a few MSP-focused blog posts or webinars | Some presence: 1-2 events, a few MSP-focused blog posts or webinars. Getting noticed. |
| 4 | Active in MSP communities, regular event presence and content, some influencers know your name | Active in MSP communities, regular event presence and content, some influencers know your name. Recognized. |
| 5 | Well-known: recognized at IT Nation, Pax8 Beyond, DattoCon, MSP influencers advocate for your product | Well-known: recognized at IT Nation, Pax8 Beyond, DattoCon, MSP influencers advocate for your product. Category presence. |


#### Q4 — Existing MSP Relationships
**Context:** Many vendors already have MSPs using their product as direct customers without realizing it. Those hidden relationships are your fastest path to an initial partner base.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No known MSP customers or relationships, no inbound partner interest | No known MSP customers or relationships, no inbound partner interest. Greenfield only. |
| 2 | Suspect some customers may be MSPs but haven't identified them | Suspect some customers may be MSPs but haven't identified them. Hidden base. |
| 3 | A handful of MSPs use product as direct customers, one or two asked about partner pricing | A handful of MSPs use product as direct customers, one or two asked about partner pricing. Early signals. |
| 4 | 10-20+ MSPs actively using product, several requested formal partner relationship | 10-20+ MSPs actively using product, several requested formal partner relationship. Ready to formalize. |
| 5 | Significant MSP customer base actively requesting partner program, better pricing, and multi-tenant capabilities | Significant MSP customer base actively requesting partner program, better pricing, and multi-tenant capabilities. Demand is there. |


#### Q5 — Competitive Recruitment Advantage
**Context:** MSPs already have a vendor in your category. To win them, you need a clear use case and differentiator. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No clear differentiation for MSPs vs. incumbent, we're a good product isn't enough | No clear differentiation for MSPs vs. incumbent, we're a good product isn't enough. No switch story. |
| 2 | Minor product differences, high MSP switching cost, unclear benefit | Minor product differences, high MSP switching cost, unclear benefit. Hard to justify switch. |
| 3 | Some differentiation (better UX, unique feature), haven't tested why switch message with MSPs | Some differentiation (better UX, unique feature), haven't tested why switch message with MSPs. Unvalidated. |
| 4 | Clear differentiation that matters: better margins, multi-tenancy, less conflict. Validated with a few MSPs. | Clear differentiation that matters: better margins, multi-tenancy, less conflict. Validated with a few MSPs. Compelling story. |
| 5 | Compelling why switch backed by real MSP feedback, MSPs frustrated with incumbent and actively looking | Compelling why switch backed by real MSP feedback, MSPs frustrated with incumbent and actively looking. Market ready to move. |


---


### Section 5: Enablement & Partner Experience
**Description:** MSPs need clear, consistent enablement with a predictable experience. 


#### Q1 — Partner Onboarding Experience
**Context:** If a new partner doesn't deploy a client within 30 days, the probability of them ever activating drops to under 20%.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No onboarding process, partners get a login and are on their own | No onboarding process, partners get a login and are on their own. Sink or swim. |
| 2 | Basic welcome email and documentation, no structured path or live training | Basic welcome email and documentation, no structured path or live training. Minimal support. |
| 3 | Onboarding with some training (videos, docs), not MSP-specific, doesn't target first client in 30 days | Onboarding with some training (videos, docs), not MSP-specific, doesn't target first client in 30 days. Generic. |
| 4 | Structured MSP onboarding with live/guided training, clear milestones, path to first client in 30 days | Structured MSP onboarding with live/guided training, clear milestones, path to first client in 30 days. Built for activation. |
| 5 | White-glove: dedicated onboarding manager, technical and sales training, first-client deployment assistance, 30/60/90-day checkpoints | White-glove: dedicated onboarding manager, technical and sales training, first-client deployment assistance, 30/60/90-day checkpoints. Best-in-class activation. |


#### Q2 — MSP Sales Enablement
**Context:** MSPs sell your product to their clients. If you haven't given them the tools, they'll default to selling the product they already know.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No sales materials designed for MSP partners | No sales materials designed for MSP partners. MSPs wing it. |
| 2 | Generic sales materials targeting end customers, not MSPs selling to their clients | Generic sales materials targeting end customers, not MSPs selling to their clients. Wrong audience. |
| 3 | Some MSP-usable materials (datasheets, basic pitch deck), no battlecards or ROI tools | Some MSP-usable materials (datasheets, basic pitch deck), no battlecards or ROI tools. Partial toolkit. |
| 4 | Solid MSP toolkit: co-branded pitch deck, battlecards, client-facing datasheets, basic ROI tools | Solid MSP toolkit: co-branded pitch deck, battlecards, client-facing datasheets, basic ROI tools. MSPs can sell. |
| 5 | Comprehensive: pitch decks, battlecards, ROI calculators, email templates, proposal templates, objection handling, MSP-to-client selling playbook | Comprehensive: pitch decks, battlecards, ROI calculators, email templates, proposal templates, objection handling, MSP-to-client selling playbook. Full sales engine. |


#### Q3 — Technical Training & Certification
**Context:** MSP technicians need to be self-sufficient. They should become Super-Users of your product. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No training program, MSPs learn by trial and error | No training program, MSPs learn by trial and error. High support cost, slow adoption. |
| 2 | Basic product training (videos/docs), not MSP-designed, covers features not practice building | Basic product training (videos/docs), not MSP-designed, covers features not practice building. Feature training only. |
| 3 | MSP-relevant training covering product and deployment, no certification or practice-building guidance | MSP-relevant training covering product and deployment, no certification or practice-building guidance. Good start. |
| 4 | Structured certification for MSP technicians covering product, deployment, troubleshooting, basic practice building | Structured certification for MSP technicians covering product, deployment, troubleshooting, basic practice building. Credible certification. |
| 5 | Comprehensive certification: product mastery, service delivery, client onboarding, practice economics, multiple levels, used as MSP recruiting differentiator | Comprehensive certification: product mastery, service delivery, client onboarding, practice economics, multiple levels, used as MSP recruiting differentiator. Market differentiator. |


#### Q4 — Partner Support Experience
**Context:** Are you prepared to build a dedicated Partner support structure? 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Same support queue as end users, no differentiation | Same support queue as end users, no differentiation. Partners treated like everyone else. |
| 2 | Separate email alias or form, same response times and quality as end users | Separate email alias or form, same response times and quality as end users. Same SLA, different inbox. |
| 3 | Dedicated partner channel with somewhat faster response, no named partner manager | Dedicated partner channel with somewhat faster response, no named partner manager. Better but not dedicated. |
| 4 | Priority SLAs, named partner manager or success team, escalation paths for MSP urgency | Priority SLAs, named partner manager or success team, escalation paths for MSP urgency. Partner-first support. |
| 5 | Best-in-class: dedicated partner success manager, priority SLAs, proactive health checks, dedicated Slack/Teams channel, technical advisory resources | Best-in-class: dedicated partner success manager, priority SLAs, proactive health checks, dedicated Slack/Teams channel, technical advisory resources. Partners never blocked. |


#### Q5 — NFR & Demo Environment
**Context:** NFR and demo environments are necessary tools for MSPs to learn and show how your product enhances customer outcomes. 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No NFR licenses or demo environment | No NFR licenses or demo environment. MSPs sell blind. |
| 2 | NFR on request but limited (short duration or restricted features), no demo environment | NFR on request but limited (short duration or restricted features), no demo environment. Token gesture. |
| 3 | NFR with reasonable terms, basic demo capability but not a dedicated sandbox | NFR with reasonable terms, basic demo capability but not a dedicated sandbox. Partial enablement. |
| 4 | Generous NFR (full-featured, ongoing), dedicated demo/sandbox for partner sales | Generous NFR (full-featured, ongoing), dedicated demo/sandbox for partner sales. MSPs can sell confidently. |
| 5 | Comprehensive: full-featured internal-use licenses, dedicated sandbox with pre-loaded demo data, tools for live demos and POCs | Comprehensive: full-featured internal-use licenses, dedicated sandbox with pre-loaded demo data, tools for live demos and POCs. Full sales enablement. |


---


### Section 6: Competitive & Distribution Landscape
**Description:** You're not entering an empty market. You're competing for shelf space in a partner's stack.


#### Q1 — Competitor MSP Program Maturity
**Context:** If competitors have polished MSP programs with large partner bases, you're entering with a speed disadvantage. If theirs are weak, you have a window.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Top competitors have mature, well-funded programs with large partner bases, entering late | Top competitors have mature, well-funded programs with large partner bases, entering late. Speed disadvantage. |
| 2 | Two or three competitors have established programs, need clear why switch story | Two or three competitors have established programs, need clear why switch story. Must differentiate. |
| 3 | Competitors have mediocre programs, MSPs have complaints, room to win | Competitors have mediocre programs, MSPs have complaints, room to win. Opportunity. |
| 4 | Competitors have early or weak programs, market still forming, well-executed program would stand out | Competitors have early or weak programs, market still forming, well-executed program would stand out. Open window. |
| 5 | No competitor has a strong MSP program in your category, greenfield opportunity | No competitor has a strong MSP program in your category, greenfield opportunity. First-mover advantage. |


#### Q2 — Distributor Coverage Gaps
**Context:** If competitors are leveraging distributors and you're not, MSPs may buy the competitor because it's easier.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Competitors locked up key distributors, no obvious openings | Competitors locked up key distributors, no obvious openings. Hard to get listed. |
| 2 | Competitors on major distributors, you could list but compete head-to-head from weaker position | Competitors on major distributors, you could list but compete head-to-head from weaker position. Uphill battle. |
| 3 | Some distributor coverage gaps, one or two distributors lack a strong option in your category | Some distributor coverage gaps, one or two distributors lack a strong option in your category. Opening exists. |
| 4 | Clear gap: a major distributor actively looking for a vendor in your category or competitor relationship weakening | Clear gap: a major distributor actively looking for a vendor in your category or competitor relationship weakening. Timing opportunity. |
| 5 | Distributor white space, could be first/strongest in category, distributors have expressed interest | Distributor white space, could be first/strongest in category, distributors have expressed interest. Greenfield distribution. |


#### Q3 — MSP Platform Ecosystem Fit
**Context:** Does your product complement or enhance adjacent products or does your product have overlapping features that make it confusing? 


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Directly competes with a module in a major MSP platform | Directly competes with a module in a major MSP platform. Friction with platform vendors. |
| 2 | Some overlap with platform capabilities, potential friction | Some overlap with platform capabilities, potential friction. Need clear positioning. |
| 3 | Neutral: doesn't compete or complement, standalone addition | Neutral: doesn't compete or complement, standalone addition. Fits alongside. |
| 4 | Complements and integrates with one or more major MSP platforms | Complements and integrates with one or more major MSP platforms. Better together. |
| 5 | Deep ecosystem fit: native integrations, marketplace listings, better together positioning | Deep ecosystem fit: native integrations, marketplace listings, better together positioning. Native to MSP stack. |


#### Q4 — MSP-Specific Differentiation
**Context:** Being better isn't enough. You need to be better in ways MSPs care about: margins, multi-tenancy, conflict policies, onboarding speed.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No MSP-specific differentiation, advantages relevant to end customers only | No MSP-specific differentiation, advantages relevant to end customers only. Wrong value prop. |
| 2 | Some MSP-relevant advantages but incremental, not decisive | Some MSP-relevant advantages but incremental, not decisive. Nice to have. |
| 3 | Clear differentiators on 1-2 MSP-relevant dimensions, not yet validated with MSPs | Clear differentiators on 1-2 MSP-relevant dimensions, not yet validated with MSPs. Potential. |
| 4 | Strong differentiation on multiple dimensions, validated by MSP feedback | Strong differentiation on multiple dimensions, validated by MSP feedback. Compelling. |
| 5 | Decisive advantage: product, pricing, support, and partner experience clearly superior on MSP priorities | Decisive advantage: product, pricing, support, and partner experience clearly superior on MSP priorities. No-brainer for MSPs. |


#### Q5 — Market Timing & Window
**Context:** Timing matters as much as product quality. Competitor acquisitions, pricing changes, and compliance mandates create windows that open and close.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No timing advantage, market stable, competitors entrenched | No timing advantage, market stable, competitors entrenched. No urgency. |
| 2 | Minor market shifts, nothing creating urgency | Minor market shifts, nothing creating urgency. Status quo. |
| 3 | Some market movement (acquisition, new compliance requirements) creating moderate opportunity | Some market movement (acquisition, new compliance requirements) creating moderate opportunity. Some movement. |
| 4 | Clear timing window from competitor disruption or market shift creating partner movement | Clear timing window from competitor disruption or market shift creating partner movement. Window open. |
| 5 | Urgent window forcing MSPs to reevaluate vendors now | Urgent window forcing MSPs to reevaluate vendors now. |


---


### Section 7: Existing MSP Channel Health
**Description:** If you already have MSP partners, this section matters. If not, skip it and we'll adjust your score.


#### Q1 — Partner Activation Rate
**Context:** Signed partners who never deploy are dead weight. Activation rate tells you whether onboarding and enablement are working.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Under 20% of signed partners deployed with even one client | Under 20% of signed partners deployed with even one client. Most never activate. |
| 2 | 20-35% activation, handful active, most signed up and never engaged | 20-35% activation, handful active, most signed up and never engaged. Leaky funnel. |
| 3 | 35-50% activation, roughly half producing, long tail of inactive | 35-50% activation, roughly half producing, long tail of inactive. Room to improve. |
| 4 | 50-70% activation, majority deploying, clear success patterns | 50-70% activation, majority deploying, clear success patterns. Onboarding works. |
| 5 | 70%+ activation, strong onboarding-to-activation pipeline with success data | 70%+ activation, strong onboarding-to-activation pipeline with success data. Best-in-class activation. |


#### Q2 — Revenue Concentration
**Context:** If 80% of partner revenue comes from 2 partners, you don't have a program. You have 2 relationships.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Revenue concentrated in 1-2 partners, if they leave the program collapses | Revenue concentrated in 1-2 partners, if they leave the program collapses. Not a program. |
| 2 | Top 3-5 partners generate 70%+ of revenue, high concentration risk | Top 3-5 partners generate 70%+ of revenue, high concentration risk. Fragile. |
| 3 | Somewhat distributed, top 10 account for most revenue, growing middle tier | Somewhat distributed, top 10 account for most revenue, growing middle tier. Improving. |
| 4 | Healthy distribution, no single partner over 15%, strong middle tier | Healthy distribution, no single partner over 15%, strong middle tier. Resilient. |
| 5 | Well-distributed across broad base, multiple tiers contributing, losing one partner is immaterial | Well-distributed across broad base, multiple tiers contributing, losing one partner is immaterial. Mature program. |


#### Q3 — Partner Retention
**Context:** Annual churn above 25% means you're refilling a leaky bucket.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | Annual churn above 40%, partners leave due to product, pricing, or support | Annual churn above 40%, partners leave due to product, pricing, or support. Critical issue. |
| 2 | 25-40% churn, mixed reasons, no formal retention strategy | 25-40% churn, mixed reasons, no formal retention strategy. Leaky bucket. |
| 3 | 15-25% churn, some understanding of why, beginning retention tactics | 15-25% churn, some understanding of why, beginning retention tactics. Getting a handle. |
| 4 | 10-15% churn, clear understanding of drivers, active retention with QBRs | 10-15% churn, clear understanding of drivers, active retention with QBRs. Managed retention. |
| 5 | Under 10% churn, partners loyal and growing, strong satisfaction, churn rare and due to partner business changes | Under 10% churn, partners loyal and growing, strong satisfaction, churn rare and due to partner business changes. Loyal base. |


#### Q4 — Time to First Client Deployment
**Context:** The faster a new partner gets their first client on your platform, the more likely they become a long-term productive partner.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | 6+ months average to first client, most stall during onboarding | 6+ months average to first client, most stall during onboarding. Too slow. |
| 2 | 3-6 months, significant hand-holding needed | 3-6 months, significant hand-holding needed. Resource intensive. |
| 3 | 1-3 months, onboarding works but could be faster | 1-3 months, onboarding works but could be faster. Acceptable. |
| 4 | Under 30 days for most partners, clear path with milestones | Under 30 days for most partners, clear path with milestones. Strong onboarding. |
| 5 | Under 14 days, self-serve onboarding, first deployment is a repeatable process | Under 14 days, self-serve onboarding, first deployment is a repeatable process. Best-in-class. |


#### Q5 — Partner Satisfaction & Advocacy
**Context:** Happy partners recruit other partners. Unhappy partners warn the community. Word-of-mouth is the most powerful force in MSP partner recruitment.


| Score | Short label | Full description |
|-------|-------------|------------------|
| 1 | No formal measurement, anecdotally frustrated/disengaged, negative word-of-mouth | No formal measurement, anecdotally frustrated/disengaged, negative word-of-mouth. Reputation risk. |
| 2 | No formal NPS, mixed signals, some happy, some vocal about problems | No formal NPS, mixed signals, some happy, some vocal about problems. Unclear picture. |
| 3 | Some satisfaction data (informal surveys/QBR feedback), average results, neutral | Some satisfaction data (informal surveys/QBR feedback), average results, neutral. Room to improve. |
| 4 | Formal partner NPS (30+), some actively refer others | Formal partner NPS (30+), some actively refer others. Advocates emerging. |
| 5 | High NPS (50+), vocal advocates, refer MSPs, participate in case studies, serve on advisory board | High NPS (50+), vocal advocates, refer MSPs, participate in case studies, serve on advisory board. Partner-led growth. |


---


## 4. Assessment UI Strings (`src/components/AssessmentSection.tsx`)


- Progress: "Section X of 7"
- Validation: "Please answer all questions before continuing."
- Buttons: "← Previous" | "Next →"


---


## 5. Financials Page (`src/app/assessment/financials/page.tsx`, `src/components/FinancialsForm.tsx`)


**Page header**
- Your Numbers
- We use these to model the financial impact of an MSP channel. Estimates are fine.


**Form labels**
- Current Annual Recurring Revenue (ARR) in USD *
- Average Contract Value (ACV) per customer per year in USD *
- Current number of customers *
- Percentage of revenue from direct sales today
- Average sales cycle length in days (optional)
- Current Customer Acquisition Cost (CAC) in USD (optional)


**Placeholders**
- e.g. 2,500,000
- e.g. 5,000
- e.g. 150
- 45
- Leave blank to use benchmark


**Helper**
- Benchmark if blank: (ARR × 15%) ÷ customers, minimum $5,000


**Validation**
- Enter a valid ARR (e.g. 1000000)
- Enter a valid ACV (e.g. 5000)
- Enter number of customers
- Enter a valid number of days
- Enter a valid CAC


**Buttons**
- ← Previous
- See My Results →


---


## 6. Results / Teaser Page (`src/components/ResultsTeaser.tsx`, `src/lib/scoring.ts`)


**Headings**
- Your Readiness Score
- Section Scores
- 3-Year Channel Revenue Projection
- CAC Reduction Estimate
- Cost of Delay (12-month wait)
- Critical Items


**Tier labels** (`TIER_LABELS` in `src/lib/scoring.ts`)
- MSP Program Ready
- MSP Capable
- MSP Emerging
- MSP Premature


**Tier score ranges** (`TIER_SCORE_RANGES`)
- 85-100 | 65-84 | 45-64 | Below 45


**Tier definitions** (`TIER_DEFINITIONS`)
- **Ready:** Strong foundation across all dimensions. Your product, pricing, and organization are positioned for MSP distribution. Focus shifts to program design, partner recruitment strategy, and distributor placement.
- **Capable:** Good product-market fit for the MSP channel with targeted gaps to close before launch. The foundation is there, but specific areas need attention to avoid early program failures that damage your reputation in the MSP community.
- **Emerging:** Your product has potential for MSP distribution but requires meaningful foundational work before a program launch would succeed. Launching prematurely in the MSP ecosystem is worse than waiting, because word travels fast and first impressions stick.
- **Premature:** Significant gaps exist across multiple dimensions. Launching an MSP program today would waste investment and damage your credibility in a community where reputation is everything. Focus on product maturity and organizational readiness before pursuing MSP distribution.


**Tier interpretations** (`TIER_INTERPRETATIONS`, used when AI summary isn’t ready)
- **Ready:** Strong foundation. Focus on program design, recruitment, and distributor placement.
- **Capable:** Good product-market fit with targeted gaps to close before launch.
- **Emerging:** Product has potential but requires meaningful foundational work.
- **Premature:** Significant gaps. Focus on product maturity before pursuing MSP distribution.


**Section labels (chart)**
- Product Architecture | Pricing & Economics | Organization & GTM | Partner Ecosystem | Enablement | Competitive Landscape | Channel Health


**Table headers (projection)**
- Metric | Year 1 | Year 2 | Year 3
- Active MSP Partners | Avg Clients per Partner | Total MSP Clients | MSP Revenue | MSP Revenue as % of Current ARR


**CAC / cost-of-delay copy**
- MSP channel typically reduces CAC by 40–60%. At your current CAC of $X, that could mean $X–$X saved per new customer acquired through the channel.
- If you wait 12 months, Year 1 MSP revenue ($X) shifts to Year 2. Every quarter without an MSP channel costs approximately $X in higher acquisition costs and $X in unrealized partner revenue.


**Loading / success / error**
- Loading your results...
- ← Back to Your Numbers
- Generating your personalized summary...
- Generating your report...
- Your full report has been sent to **{email}**. Check your inbox for a detailed breakdown with financial projections and a customized roadmap.
- Book a Complimentary Deep-Dive Assessment
- Didn't receive it? Check spam or contact jon@untappedchannelstrategy.com
- We couldn't save your assessment. … Please try again or contact jon@untappedchannelstrategy.com
- Try again
- ← Back to start


---


## 7. Red Flag Messages (`src/lib/scoring.ts` — `detectRedFlags`)


- Critical: No multi-tenant management. MSPs will not adopt a product that requires separate logins per client.
- Critical: No PSA/RMM integrations. MSPs can't connect your product to their operational backbone.
- Critical: Pricing model isn't built for MSP economics. Partners can't make the math work.
- Critical: No channel conflict resolution. Your direct sales team will destroy partner trust.
- Critical: No executive commitment to a 12+ month investment. The program will be killed before it can produce results.


---


## 8. Report Narrative — AI Instructions & Fallback (`src/lib/narrative.ts`)


*The report narrative is either generated by Claude (using the system prompt and user prompt built from assessment data) or a fallback template. Editing the system prompt changes how the AI writes; editing the fallback changes what users see when the API fails or is unavailable.*


### Required closing sentence (executive summary)
- Regardless of where you landed, the logical next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.


### Fallback narrative templates (`generateFallbackNarrative`)


**Section interpretation (high/mid/low):**
- High: "You scored X/25 in {Section Name}. That is a competitive advantage; MSPs will notice." | Recommendation: "Leverage this strength in partner recruitment and positioning."
- Mid: "You scored X/25 in {Section Name}. Solid foundation, but MSPs will compare you to vendors who have nailed this." | Recommendation: "Identify the top two gaps in this dimension and address them before launch."
- Low: "You scored X/25 in {Section Name}. That is a blocker; no amount of partner recruitment will overcome it until this is fixed." | Recommendation: "Prioritize product, pricing, or operational changes in this area before scaling the channel."


**Executive summary (fallback):**
- Your overall score of X/100 places you in the {Tier Label} tier. {Weakest phrase}. {Strongest phrase}. {Red flags or focus phrase}. Regardless of where you landed, the logical next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.


**Financial commentary (fallback):**
- Based on your ARR of $X and ACV of $X, the 3-year MSP revenue projections in this report use conservative assumptions. Your product category and readiness level influence how quickly you can ramp.


**Cost of delay (fallback):**
- Every quarter without an MSP channel has a real cost in higher acquisition spend and unrealized partner-sourced revenue. In {product category}, competitors and distributors are moving now.


**Roadmap (fallback by tier):**
- **Ready:** We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. After that, you are roughly 3 to 4 months from a launch-ready program with the right playbook and recruitment plan.
- **Capable:** We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Then plan for 4 to 6 months to close targeted gaps and stand up program design and recruitment.
- **Emerging:** We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Expect 6 to 9 months of foundational work after that before scaling the channel.
- **Premature:** We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Allow 12 or more months after that to address significant gaps before investing in partner recruitment.


*The full AI system prompt (voice, rules, banned phrases, examples) is in `src/lib/narrative.ts` — edit there to change AI-generated report tone and structure.*


---


## 9. PDF Report Static Copy (`src/lib/pdf-document.tsx`)


**Cover**
- MSP Channel Readiness Assessment
- Prepared for {companyName}
- Document title: MSP Channel Readiness Assessment - {companyName}
- Author: Untapped Channel Strategy


**Section headings**
- Executive Summary
- Critical items
- Your answers
- Strengths
- Gaps
- Financial Impact Analysis
- Cost of Delay
- DIY vs. Expert-Guided Build
- What Comes Next


**Financial table**
- Metric | Year 1 | Year 2 | Year 3
- Active MSP Partners | Avg Clients per Partner | Total MSP Clients | MSP Revenue | MSP Revenue as % of ARR


**Cost of delay (in-PDF stat line)**
- Every quarter without an MSP channel costs approximately $X in higher acquisition costs and $X in unrealized partner revenue.


**DIY vs Expert page**
- DIY Build (18-24 months)
- VP/Director Channel hire: $180K-$250K/yr fully loaded
- 1-2 channel managers: $100K-$150K each
- Time to productivity: 6-9 months
- First 18 months cost: $350K-$550K salary + $50K-$100K program costs
- Total: $500K-$900K over 18 months, revenue starting month 15-18
- Expert-Guided Build (6-9 months)
- Engagement: $60K-$200K over 6-9 months
- Internal hire still needed but walks into launch-ready playbook
- Revenue starts month 9-12
- Mistakes avoided save $200K-$400K
- Total: $60K-$200K engagement + hire, revenue 6-9 months sooner
- Common Mistakes Tax
- 1. Wrong pricing model (6 months to discover/fix): ~40% of Year 1 MSP revenue lost
- 2. Channel conflict (9 months to surface/resolve): 30-50% of early partners disengage permanently
- 3. Wrong partner recruitment (70% never activate): $2K-$5K wasted per inactive partner
- 4. No distributor strategy (12 months to course-correct): miss 60-70% of addressable partner base
- 5. End-user enablement instead of MSP enablement (6-9 months of rework)
- The engagement does not replace your internal hire. It gives them a launch-ready playbook instead of a 12-month learning curve.


**What Comes Next**
- I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build a customized action plan. No cost, no obligation. You will walk away with actionable insight whether or not we work together.
- Jon Purcell | Untapped Channel Strategy | untappedchannelstrategy.com
- Book Your Complimentary Deep-Dive Assessment


**Disclaimer (financial projections)**
- These projections are estimates based on industry benchmarks and the data you provided. Actual results will vary based on execution, market conditions, and program investment. These figures are intended to illustrate the potential scale of opportunity, not guarantee specific outcomes.


**Footer (every page)**
- Untapped Channel Strategy | untappedchannelstrategy.com


---


## 10. PDF Section / Question Labels (`src/lib/pdf-questions.ts`)


*Used in the PDF for section headers and for “Your answers” question names. Keep in sync with section data if you rename questions.*


**Section PDF labels:** Product Architecture | Pricing & Economics | Organization & GTM | Partner Ecosystem | Enablement | Competitive Landscape | Channel Health


**Question names per section (for PDF “Your answers” and strengths/gaps):**
- Section 1: Multi-Tenant Management, API & Integration Depth, Automated Provisioning, White-Label / Co-Brand, Client Reporting & Value Demo
- Section 2: MSP-Friendly Pricing, Partner Margin Viability, Billing & Invoicing Flexibility, Recurring Revenue Alignment, MSP Cost to Deliver
- Section 3: Executive Commitment, Channel Conflict Readiness, Dedicated Channel Resources, Product Roadmap Responsiveness, Go-to-Market Clarity
- Section 4: Category Demand from MSPs, Distributor Relationship, MSP Community Visibility, Existing MSP Relationships, Competitive Recruitment Advantage
- Section 5: Partner Onboarding, MSP Sales Enablement, Technical Training & Certification, Partner Support Experience, NFR & Demo Environment
- Section 6: Competitor MSP Program Maturity, Distributor Coverage Gaps, MSP Platform Ecosystem Fit, MSP-Specific Differentiation, Market Timing & Window
- Section 7: Partner Activation Rate, Revenue Concentration, Partner Retention, Time to First Client Deployment, Partner Satisfaction & Advocacy


---


*After editing, search this doc for the phrase you changed to find the file and (where applicable) the variable or config key to update in the codebase.*



