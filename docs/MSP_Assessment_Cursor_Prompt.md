# MSP CHANNEL READINESS ASSESSMENT - CURSOR BUILD PROMPT

## PROJECT OVERVIEW

Build a full-stack web application called the **MSP Channel Readiness Assessment**. This is a lead generation tool for a channel consulting practice. B2B software vendor executives (CEOs, CROs, VPs of Sales) complete a 10-minute self-assessment that scores their readiness to launch an MSP partner program. They receive a professional PDF report via email with their scores, financial projections, and recommendations. The consultant (Jon Purcell) receives a copy of every submission with full contact info and scores.

**This is not a toy quiz.** The questions are sophisticated, the scoring is real, and the PDF report should look like it came from a premium consulting firm. The user should finish thinking, "I didn't even know these were the questions I should be asking."

---

## BRANDING

- **Company:** Untapped Channel Strategy
- **Founder:** Jon Purcell
- **Website:** untappedchannelstrategy.com
- **Tagline:** "Untapped channel. Revenue by design."
- **Consultant Email:** jon@untappedchannelstrategy.com
- **Booking Link:** [INSERT CALENDLY/CAL.COM LINK HERE]
- **Credential Line:** "Built Apple's MSP program from zero. Rebuilding Workiva's. 9 years in VMware's channel organization."
- **Color Palette:**
  - Dark Blue (primary): #1B3A5C
  - Teal (accent): #1A8A7D
  - White: #FFFFFF
  - Light Gray (background): #F4F7FA
  - Green (MSP Ready tier): #2D8C46
  - Amber (MSP Emerging tier): #D97706
  - Red (MSP Premature tier): #DC2626
- **Font:** Inter (with system sans-serif fallback)
- **No em dashes anywhere.** Use commas, periods, colons, or separate sentences.

---

## TECH STACK

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (for assessment form state that persists across routes)
- **Database:** Supabase (PostgreSQL) for storing submissions
- **Email:** Resend (for sending PDF reports to user and admin)
- **PDF Generation:** @react-pdf/renderer (server-side PDF generation)
- **Auth:** Simple password-protected admin route (no full auth system needed, just a shared secret/env variable)
- **Deployment:** Vercel
- **AI Narrative:** Anthropic Claude API (claude-sonnet-4-20250514) for generating personalized PDF report narratives
- **Charts (in PDF):** Use @react-pdf/renderer's drawing primitives or pre-render charts as SVG

---

## APPLICATION ROUTES

```
/                          → Welcome / Landing page with lead capture form
/assessment/financials     → Financial context inputs
/assessment/product        → Section 1: MSP-Ready Product Architecture
/assessment/pricing        → Section 2: Pricing & Partner Economics
/assessment/organization   → Section 3: Organizational & GTM Readiness
/assessment/ecosystem      → Section 4: Partner Ecosystem & Recruitment
/assessment/enablement     → Section 5: Enablement & Partner Experience
/assessment/competitive    → Section 6: Competitive & Distribution Landscape
/assessment/channel-health → Section 7: Existing MSP Channel Health (conditional)
/assessment/results        → Results teaser + email gate for full report
/admin                     → Password-protected admin dashboard
```

---

## USER FLOW

1. **Landing Page (/):** User enters contact info (name, title, company, website, email, phone, product category). Clicks "Start Assessment."
2. **Assessment Sections (Screens 2-8/9):** User answers 5 questions per section on a 1-5 scale. Progress bar shows completion. Navigation allows going back to previous sections. Section 7 is conditional (only shown if user indicates existing MSP relationships).
3. **Financial Context:** Collected AFTER the assessment sections (not before). By this point the user is invested and more willing to share financial data. This screen collects ARR, ACV, customer count, direct sales %, sales cycle, CAC, and existing MSP relationship status.
4. **Results Teaser:** Shows the overall score prominently, the readiness tier with color, a brief interpretation (2-3 sentences), and a section-by-section score bar chart. The full detailed report (PDF) is NOT downloadable here. Instead: "Your full report with financial projections, gap analysis, and recommended roadmap has been sent to [their email]."
5. **Email Delivery:** On submission, two emails are sent:
   - To the user: professional email with PDF report attached
   - To jon@untappedchannelstrategy.com: notification email with all contact info, all scores, all financial inputs, and the same PDF attached
6. **Admin Dashboard (/admin):** Password-protected page showing a table of all submissions with: date, name, company, email, phone, title, product category, overall score, tier, and a link to view full details/download their PDF.

---

## SCREEN-BY-SCREEN SPECIFICATION

### Screen 1: Welcome / Landing (/)

**Hero Section:**
- Headline: "Is Your Product Ready for MSP Distribution?"
- Subheadline: "Find out in 10 minutes. Get a personalized readiness score and financial impact analysis."
- Body: "MSPs control access to millions of SMBs. This assessment evaluates your product, pricing, organization, and competitive position against the 7 dimensions that determine whether an MSP program will succeed or fail."

**Lead Capture Form:**
- Full Name (text, required)
- Email Address (email, required)
- Phone Number (tel, required)
- Title (dropdown, required): CEO/Founder, CRO, VP of Sales, VP/Head of Partnerships, Other
- Company Name (text, required)
- Company Website (url, optional)
- Product Category (dropdown, required): Cybersecurity, Backup & DR, Compliance / GRC, Identity / IAM, IT Operations, SaaS Management, Email Security, Other

**CTA Button:** "Start Assessment →"

**Below the form, add social proof / credibility:**
- "Designed by Jon Purcell, who built Apple's MSP program from zero, spent 9 years in VMware's channel organization, and is currently rebuilding Workiva's MSP motion."

---

### Screens 2-8: Assessment Sections

Each assessment screen has:
- Section number and title at top
- A one-line section description explaining why this dimension matters
- 5 questions, each displayed as:
  - **Question name** (bold header)
  - One-line context sentence (gray/muted text explaining why this matters to MSPs)
  - 5 selectable options (1-5 scale) displayed as **cards or large radio buttons**
  - Each option shows its number (1-5) and a SHORT label (15-25 words max visible). The full description text is available on hover/tap or via an expand toggle. Do NOT show all 5 full paragraph descriptions simultaneously; it's overwhelming on mobile.
- "Previous" and "Next" buttons at bottom
- Progress indicator showing which section they're on (e.g., "Section 3 of 7" or a progress bar)

**IMPORTANT UX DETAIL:** When a user selects an option, briefly highlight it with the teal accent color. The selection should feel responsive and satisfying.

**All answers are stored in Zustand global state** so navigation between sections preserves all data.

---

### SECTION 1: MSP-Ready Product Architecture (Screen 2)

**Route:** /assessment/product
**Section Description:** "MSPs manage dozens or hundreds of clients. If your product can't handle that operational reality, nothing else matters."

**Q1: Multi-Tenant Management**
Context: "MSPs need to manage all their clients from one place. Logging into separate instances per client is a dealbreaker."
- 1 = Single-tenant only, separate instance per client
- 2 = Basic multi-client view, limited, no isolation or RBAC
- 3 = Multi-tenant console with basic separation, missing delegated admin or per-client policies
- 4 = Strong multi-tenant with isolation, RBAC, per-client config, minor gaps
- 5 = Full multi-tenant platform: hierarchical management, delegated admin, per-client policies, bulk operations

**Q2: API & Integration Depth**
Context: "MSPs run their business through PSA and RMM platforms. If your product doesn't connect to their operational backbone, it stays on the shelf."
- 1 = No public API, no PSA/RMM integrations
- 2 = Basic API (read-only or limited), no PSA/RMM integrations
- 3 = Functional API with key endpoints, one or two non-native integrations
- 4 = Well-documented API, native integrations with 2+ major PSA/RMM platforms
- 5 = Comprehensive API with webhooks and automation, native integrations with 3+ PSA/RMM platforms actively used by MSPs

**Q3: Automated Provisioning**
Context: "When an MSP signs a new client on Monday, they need that client live on your platform by Tuesday. Not next week."
- 1 = Manual setup by vendor team, days or weeks to provision
- 2 = Partially manual, MSP needs vendor involvement to complete
- 3 = MSP self-provisions via UI but multiple manual steps, 1-2 hours per client
- 4 = Streamlined provisioning via UI or API, under 30 minutes, minimal manual steps
- 5 = Fully automated via API/script/one-click, minutes to provision, supports bulk

**Q4: White-Label / Co-Brand Capability**
Context: "MSPs sell their brand, not yours. If every touchpoint carries your logo, the MSP is training their client to buy direct."
- 1 = No customization, all surfaces carry vendor brand
- 2 = Minor customization (one logo placement), vendor brand dominates
- 3 = Partial white-label on some elements, vendor brand still visible in key areas
- 4 = Strong co-brand across most client-facing surfaces, "powered by" treatment
- 5 = Full white-label: custom domains, branded portals, reports, and emails

**Q5: Client Reporting & Value Demonstration**
Context: "MSPs justify their monthly fee by showing clients the value delivered. If they can't pull a report that proves it, your product becomes hard to defend at renewal."
- 1 = No client-facing reporting, MSPs build reports manually
- 2 = Basic reporting exists but not MSP-designed, no per-client breakdown
- 3 = Per-client reports with relevant metrics, limited customization, no scheduled delivery
- 4 = Good reporting with per-client breakdowns, multiple formats, some branding, scheduled delivery
- 5 = MSP-optimized: full customization, white-label, scheduled delivery, executive summaries, trend analysis for upselling

---

### SECTION 2: Pricing & Partner Economics (Screen 3)

**Route:** /assessment/pricing
**Section Description:** "If the math doesn't work for the MSP, they won't invest. Period."

**Q1: MSP-Friendly Pricing Structure**
Context: "Enterprise pricing (annual contracts, flat fees, minimum commitments) kills MSP economics. MSPs need per-unit pricing that flexes with their client base."
- 1 = Enterprise pricing only: annual contracts, flat fees, minimums that don't flex
- 2 = Some per-unit element but not MSP-designed, no volume tiers or aggregate billing
- 3 = Per-seat/per-device pricing with some volume tiers, not optimized for MSP buying patterns
- 4 = MSP-friendly per-unit pricing with volume tiers and aggregate pricing across MSP client base
- 5 = Purpose-built MSP pricing: consumption-based, aggressive volume tiers, aggregate billing, gets cheaper as MSP scales

**Q2: Partner Margin Viability**
Context: "MSPs need 20-40%+ margins to justify building a practice around your product. If the math doesn't leave room for profit after delivery costs, they'll pick a competitor."
- 1 = No partner margin structure, MSPs buy at or near retail
- 2 = Under 15% discount, thin margins after MSP delivery costs
- 3 = 15-25% margins, workable but not compelling for aggressive recruitment
- 4 = 25-35% margins with volume tiers, MSP can build a profitable practice
- 5 = 35%+ margins with transparent economics, validated with real MSP partners

**Q3: Billing & Invoicing Flexibility**
Context: "An MSP managing 80 clients does not want 80 separate invoices. Aggregate billing, monthly true-up, and flexible payment terms are table stakes."
- 1 = Per-client billing only, no aggregate invoicing, manual adds/changes
- 2 = Aggregate billing technically possible but clunky, mid-month changes need support tickets
- 3 = Aggregate billing available, monthly invoicing works, proration/true-up require manual steps
- 4 = Clean aggregate billing with automated proration and monthly true-up, single invoice with per-client line items
- 5 = Fully flexible: aggregate or per-client, monthly true-up, automated proration, API-accessible billing for MSP accounting integration

**Q4: Recurring Revenue Alignment**
Context: "MSPs build monthly recurring revenue businesses. Your pricing should make it easy to wrap your product into a predictable monthly managed service."
- 1 = One-time or annual pricing, doesn't map to monthly recurring
- 2 = Monthly billing exists but structured as monthly payment on annual contract, not true month-to-month
- 3 = True monthly recurring pricing, MSPs can mark up and resell, limited service layering opportunity
- 4 = Monthly recurring designed for MSP bundling, MSPs can wrap into managed service and add value on top
- 5 = Strong MSP recurring revenue with expansion paths: upsell tiers, add modules, layer services. Product is a platform for the MSP's practice.

**Q5: MSP Cost to Deliver**
Context: "Revenue minus the MSP's cost to sell, deploy, and support your product per client equals their real margin. If it takes 4 hours per client per month to manage, the economics collapse."
- 1 = High labor per client, significant ongoing management and vendor-assisted support
- 2 = Moderate labor, dedicated time per client, not scalable past 20-30 clients
- 3 = Manageable effort, no dedicated per-client resources needed, some manual intervention
- 4 = Low effort, largely self-managing with automation/alerting, scales to 50+ clients without adding headcount
- 5 = Minimal effort, product runs autonomously, MSP role is oversight and client communication, scales to 100+ clients per technician

---

### SECTION 3: Organizational & GTM Readiness (Screen 4)

**Route:** /assessment/organization
**Section Description:** "Programs fail internally before they fail externally. This is where most vendors get it wrong."

**Q1: Executive Commitment**
Context: "MSP programs take 12-18 months to produce meaningful revenue. If leadership expects ROI in one quarter, the program will be killed before it has a chance."
- 1 = No executive awareness or interest, not on the roadmap
- 2 = Executive interest but viewed as experiment, no budget or timeline committed
- 3 = Leadership supports exploring, willing to allocate some resources, but expects results in under 6 months
- 4 = Executive sponsor committed with 12+ month horizon, budget allocated for program development
- 5 = Board-level strategic priority with dedicated budget, headcount plan, and executive sponsor with cross-functional authority

**Q2: Channel Conflict Readiness**
Context: "When a direct rep works a prospect and an MSP registers the same deal, someone has to lose. If you haven't designed for this, your direct team will kill your MSP program from the inside."
- 1 = No conflict rules, direct reps compensated on all revenue including partner-sourced, no deal registration
- 2 = Topic discussed but no formal policy, direct reps would resist losing deals to partners
- 3 = Basic deal registration or territory rules on paper, inconsistent enforcement, comp not adjusted
- 4 = Formal policy with deal registration, territory boundaries, and comp adjustments that incentivize supporting partners
- 5 = Fully designed: deal registration with teeth, comp multipliers for partner-sourced revenue, clear escalation, executive-backed enforcement

**Q3: Dedicated Channel Resources**
Context: "A partner program run as a side project by someone who also manages direct sales will fail. Full stop."
- 1 = No one owns the partner channel, would be added to existing role
- 2 = One person has partial responsibility, also owns other functions, no dedicated budget
- 3 = Dedicated channel role exists (or budgeted to hire), single individual with limited budget
- 4 = Dedicated channel lead plus budget for MDF, events, and partner marketing, plan to scale
- 5 = Channel team in place (or fully budgeted) with dedicated recruitment, enablement, and success roles, meaningful budget

**Q4: Product Roadmap Responsiveness**
Context: "MSPs will surface product needs you've never heard from direct customers. If your product team ignores partner feedback, MSPs leave."
- 1 = Roadmap driven entirely by direct customer and internal priorities, no partner input mechanism
- 2 = Partners can submit requests but same backlog as everything else, no special priority
- 3 = Product team aware of MSP needs, addressed some, no formal feedback loop
- 4 = MSP requirements are defined roadmap input, partner advisory board or structured feedback loop exists
- 5 = Product team actively prioritizes MSP features, partner advisory board meets regularly, roadmap has visible "partner" category

**Q5: Go-to-Market Clarity**
Context: "'We'll sell through MSPs' is not a strategy. You need a defined ideal partner profile, a distinct MSP value proposition, and a clear understanding of how MSP distribution differs from direct."
- 1 = No MSP-specific GTM thinking, "we'll figure it out"
- 2 = General awareness MSPs are different from resellers, no defined ideal partner profile
- 3 = Some ideal MSP partner definition (size, geography, vertical), value prop partially differentiated
- 4 = Clear ideal MSP partner profile documented, distinct value prop speaking to MSP business model
- 5 = Fully developed MSP GTM: ideal partner profile, distinct value prop, defined partner journey, clear partner success metrics

---

### SECTION 4: Partner Ecosystem & Recruitment (Screen 5)

**Route:** /assessment/ecosystem
**Section Description:** "There are 40,000+ MSPs in North America. The question isn't whether they exist. It's whether they'll pick you."

**Q1: Category Demand from MSPs**
Context: "Some categories are already in every MSP's stack. Others are emerging. Where you sit determines how hard recruitment will be."
- 1 = MSPs don't deliver managed services in your category, you'd be creating a new market
- 2 = A few forward-thinking MSPs exploring your category, not standard MSP stack yet
- 3 = Growing demand, MSPs adding your category but not yet "must-have"
- 4 = Strong demand, most mid-size and large MSPs actively looking or would consider switching
- 5 = Core MSP stack category, every MSP needs a solution here, high switching intent

**Q2: Distributor Relationship Status**
Context: "Pax8, Ingram Micro Cloud, and TD SYNNEX are the highways to MSP distribution. If you're not on them, you're asking every MSP to take a detour."
- 1 = No distributor relationships, haven't explored it
- 2 = Aware of MSP distributors but no conversations, don't meet listing requirements
- 3 = In discussions with one or more distributors, application in progress
- 4 = Listed with one MSP distributor, some MSPs transacting through marketplace
- 5 = Listed with 2+ distributors, active transaction volume, distributor team promotes your product

**Q3: MSP Community Visibility**
Context: "MSPs talk to each other constantly. If they've never heard of you, your first conversation starts at zero credibility."
- 1 = No presence in MSP communities, never attended or exhibited at MSP event
- 2 = Aware of MSP communities but haven't participated, no brand recognition
- 3 = Some presence: 1-2 events, a few MSP-focused blog posts or webinars
- 4 = Active in MSP communities, regular event presence and content, some influencers know your name
- 5 = Well-known: recognized at IT Nation, Pax8 Beyond, DattoCon, MSP influencers advocate for your product

**Q4: Existing MSP Relationships**
Context: "Many vendors already have MSPs using their product as direct customers without realizing it. Those hidden relationships are your fastest path to an initial partner base."
- 1 = No known MSP customers or relationships, no inbound partner interest
- 2 = Suspect some customers may be MSPs but haven't identified them
- 3 = A handful of MSPs use product as direct customers, one or two asked about partner pricing
- 4 = 10-20+ MSPs actively using product, several requested formal partner relationship
- 5 = Significant MSP customer base actively requesting partner program, better pricing, and multi-tenant capabilities

**Q5: Competitive Recruitment Advantage**
Context: "MSPs already have a vendor in your category. To win them, you need a clear 'why switch' story."
- 1 = No clear differentiation for MSPs vs. incumbent, "we're a good product" isn't enough
- 2 = Minor product differences, high MSP switching cost, unclear benefit
- 3 = Some differentiation (better UX, unique feature), haven't tested "why switch" message with MSPs
- 4 = Clear differentiation that matters: better margins, multi-tenancy, less conflict. Validated with a few MSPs.
- 5 = Compelling "why switch" backed by real MSP feedback, MSPs frustrated with incumbent and actively looking

---

### SECTION 5: Enablement & Partner Experience (Screen 6)

**Route:** /assessment/enablement
**Section Description:** "MSPs decide in the first 90 days whether to invest in your product or shelve it. The partner experience makes or breaks that window."

**Q1: Partner Onboarding Experience**
Context: "If a new partner doesn't deploy a client within 30 days, the probability of them ever activating drops to under 20%."
- 1 = No onboarding process, partners get a login and are on their own
- 2 = Basic welcome email and documentation, no structured path or live training
- 3 = Onboarding with some training (videos, docs), not MSP-specific, doesn't target "first client in 30 days"
- 4 = Structured MSP onboarding with live/guided training, clear milestones, path to first client in 30 days
- 5 = White-glove: dedicated onboarding manager, technical and sales training, first-client deployment assistance, 30/60/90-day checkpoints

**Q2: MSP Sales Enablement**
Context: "MSPs sell your product to their clients. If you haven't given them the tools, they'll default to selling the product they already know."
- 1 = No sales materials designed for MSP partners
- 2 = Generic sales materials targeting end customers, not MSPs selling to their clients
- 3 = Some MSP-usable materials (datasheets, basic pitch deck), no battlecards or ROI tools
- 4 = Solid MSP toolkit: co-branded pitch deck, battlecards, client-facing datasheets, basic ROI tools
- 5 = Comprehensive: pitch decks, battlecards, ROI calculators, email templates, proposal templates, objection handling, MSP-to-client selling playbook

**Q3: Technical Training & Certification**
Context: "MSP technicians need to be self-sufficient. Training that covers 'how to click buttons' isn't enough. They need to build a managed service practice."
- 1 = No training program, MSPs learn by trial and error
- 2 = Basic product training (videos/docs), not MSP-designed, covers features not practice building
- 3 = MSP-relevant training covering product and deployment, no certification or practice-building guidance
- 4 = Structured certification for MSP technicians covering product, deployment, troubleshooting, basic practice building
- 5 = Comprehensive certification: product mastery, service delivery, client onboarding, practice economics, multiple levels, used as MSP recruiting differentiator

**Q4: Partner Support Experience**
Context: "When an MSP has a critical client issue at 2pm, getting in line behind end-user tickets is not acceptable."
- 1 = Same support queue as end users, no differentiation
- 2 = Separate email alias or form, same response times and quality as end users
- 3 = Dedicated partner channel with somewhat faster response, no named partner manager
- 4 = Priority SLAs, named partner manager or success team, escalation paths for MSP urgency
- 5 = Best-in-class: dedicated partner success manager, priority SLAs, proactive health checks, dedicated Slack/Teams channel, technical advisory resources

**Q5: NFR & Demo Environment**
Context: "MSPs need to 'eat their own cooking' before selling. NFR licenses let them use it internally. A demo environment lets them show prospects. Without both, your sales cycle doubles."
- 1 = No NFR licenses or demo environment
- 2 = NFR on request but limited (short duration or restricted features), no demo environment
- 3 = NFR with reasonable terms, basic demo capability but not a dedicated sandbox
- 4 = Generous NFR (full-featured, ongoing), dedicated demo/sandbox for partner sales
- 5 = Comprehensive: full-featured internal-use licenses, dedicated sandbox with pre-loaded demo data, tools for live demos and POCs

---

### SECTION 6: Competitive & Distribution Landscape (Screen 7)

**Route:** /assessment/competitive
**Section Description:** "You're not entering an empty market. You're competing for shelf space in a partner's stack."

**Q1: Competitor MSP Program Maturity**
Context: "If competitors have polished MSP programs with large partner bases, you're entering with a speed disadvantage. If theirs are weak, you have a window."
- 1 = Top competitors have mature, well-funded programs with large partner bases, entering late
- 2 = Two or three competitors have established programs, need clear "why switch" story
- 3 = Competitors have mediocre programs, MSPs have complaints, room to win
- 4 = Competitors have early or weak programs, market still forming, well-executed program would stand out
- 5 = No competitor has a strong MSP program in your category, greenfield opportunity

**Q2: Distributor Coverage Gaps**
Context: "If competitors are on Pax8 and you're not, MSPs buy the competitor because it's easier."
- 1 = Competitors locked up key distributors, no obvious openings
- 2 = Competitors on major distributors, you could list but compete head-to-head from weaker position
- 3 = Some distributor coverage gaps, one or two distributors lack a strong option in your category
- 4 = Clear gap: a major distributor actively looking for a vendor in your category or competitor relationship weakening
- 5 = Distributor white space, could be first/strongest in category, distributors have expressed interest

**Q3: MSP Platform Ecosystem Fit**
Context: "ConnectWise, Kaseya/Datto, and N-able are the ecosystems MSPs live in. Products that complement them get adopted faster."
- 1 = Directly competes with a module in a major MSP platform
- 2 = Some overlap with platform capabilities, potential friction
- 3 = Neutral: doesn't compete or complement, standalone addition
- 4 = Complements and integrates with one or more major MSP platforms
- 5 = Deep ecosystem fit: native integrations, marketplace listings, "better together" positioning

**Q4: MSP-Specific Differentiation**
Context: "Being 'better' isn't enough. You need to be better in ways MSPs care about: margins, multi-tenancy, conflict policies, onboarding speed."
- 1 = No MSP-specific differentiation, advantages relevant to end customers only
- 2 = Some MSP-relevant advantages but incremental, not decisive
- 3 = Clear differentiators on 1-2 MSP-relevant dimensions, not yet validated with MSPs
- 4 = Strong differentiation on multiple dimensions, validated by MSP feedback
- 5 = Decisive advantage: product, pricing, support, and partner experience clearly superior on MSP priorities

**Q5: Market Timing & Window**
Context: "Timing matters as much as product quality. Competitor acquisitions, pricing changes, and compliance mandates create windows that open and close."
- 1 = No timing advantage, market stable, competitors entrenched
- 2 = Minor market shifts, nothing creating urgency
- 3 = Some market movement (acquisition, new compliance requirements) creating moderate opportunity
- 4 = Clear timing window from competitor disruption or market shift creating partner movement
- 5 = Urgent window (Broadcom/VMware-level disruption) forcing MSPs to reevaluate vendors now

---

### SECTION 7: Existing MSP Channel Health (Screen 8, CONDITIONAL)

**Route:** /assessment/channel-health
**Section Description:** "If you already have MSP partners, this section matters. If not, skip it and we'll adjust your score."

**Gate Question:** "Do you have an existing MSP program or informal MSP relationships?"
- If NO: Display "Got it. We'll score you on the six dimensions that matter for a greenfield build." Auto-advance to financials.
- If YES: Show 5 questions below.

**Q1: Partner Activation Rate**
Context: "Signed partners who never deploy are dead weight. Activation rate tells you whether onboarding and enablement are working."
- 1 = Under 20% of signed partners deployed with even one client
- 2 = 20-35% activation, handful active, most signed up and never engaged
- 3 = 35-50% activation, roughly half producing, long tail of inactive
- 4 = 50-70% activation, majority deploying, clear success patterns
- 5 = 70%+ activation, strong onboarding-to-activation pipeline with success data

**Q2: Revenue Concentration**
Context: "If 80% of partner revenue comes from 2 partners, you don't have a program. You have 2 relationships."
- 1 = Revenue concentrated in 1-2 partners, if they leave the program collapses
- 2 = Top 3-5 partners generate 70%+ of revenue, high concentration risk
- 3 = Somewhat distributed, top 10 account for most revenue, growing middle tier
- 4 = Healthy distribution, no single partner over 15%, strong middle tier
- 5 = Well-distributed across broad base, multiple tiers contributing, losing one partner is immaterial

**Q3: Partner Retention**
Context: "Annual churn above 25% means you're refilling a leaky bucket."
- 1 = Annual churn above 40%, partners leave due to product, pricing, or support
- 2 = 25-40% churn, mixed reasons, no formal retention strategy
- 3 = 15-25% churn, some understanding of why, beginning retention tactics
- 4 = 10-15% churn, clear understanding of drivers, active retention with QBRs
- 5 = Under 10% churn, partners loyal and growing, strong satisfaction, churn rare and due to partner business changes

**Q4: Time to First Client Deployment**
Context: "The faster a new partner gets their first client on your platform, the more likely they become a long-term productive partner."
- 1 = 6+ months average to first client, most stall during onboarding
- 2 = 3-6 months, significant hand-holding needed
- 3 = 1-3 months, onboarding works but could be faster
- 4 = Under 30 days for most partners, clear path with milestones
- 5 = Under 14 days, self-serve onboarding, first deployment is a repeatable process

**Q5: Partner Satisfaction & Advocacy**
Context: "Happy partners recruit other partners. Unhappy partners warn the community. Word-of-mouth is the most powerful force in MSP partner recruitment."
- 1 = No formal measurement, anecdotally frustrated/disengaged, negative word-of-mouth
- 2 = No formal NPS, mixed signals, some happy, some vocal about problems
- 3 = Some satisfaction data (informal surveys/QBR feedback), average results, neutral
- 4 = Formal partner NPS (30+), some actively refer others
- 5 = High NPS (50+), vocal advocates, refer MSPs, participate in case studies, serve on advisory board

---

### Financial Context Screen (Screen 9)

**Route:** /assessment/financials
**Section Title:** "Your Numbers"
**Subtitle:** "We use these to model the financial impact of an MSP channel. Estimates are fine."

**Fields:**
- Current Annual Recurring Revenue (ARR) in USD (text input with currency formatting, required)
- Average Contract Value (ACV) per customer per year in USD (text input, required)
- Current number of customers (text input, required)
- Percentage of revenue from direct sales today (slider: 0-100%, default 100%)
- Average sales cycle length in days (text input, optional, default: 45)
- Current Customer Acquisition Cost (CAC) in USD (text input, optional, default benchmark: (ARR * 0.15) / customer count, floor $5,000)
- Do you have any existing MSP relationships today? (Yes / No / Not sure)

**CTA:** "See My Results →"

---

### Results Teaser Screen (Screen 10)

**Route:** /assessment/results

This screen shows AFTER all data is collected and submitted. On load:
1. Calculate all scores
2. Save submission to Supabase
3. Generate PDF server-side
4. Send emails (user + admin)
5. Display results teaser

**Display:**
- Overall score (large, animated number counting up to final score)
- Readiness tier label with tier color (green/teal/amber/red badge)
- 2-3 sentence interpretation of what the score means
- Section-by-section horizontal bar chart showing each section's score as a percentage of 25
- Any red flags detected, displayed as callout cards
- **Primary CTA:** "Your full report has been sent to [email]. Check your inbox for a detailed breakdown with financial projections and a customized roadmap."
- **Secondary CTA:** "Book a Complimentary Deep-Dive Assessment" linking to booking link
- **Tertiary:** "Didn't receive it? Check spam or contact jon@untappedchannelstrategy.com"

---

## SCORING LOGIC

### Section Scoring
Each section has 5 questions scored 1-5. Raw section score: 5-25.

### Overall Score Calculation

**Greenfield (Section 7 skipped):**
- Raw Total = sum of Sections 1-6 (max 150)
- Overall Score = (Raw Total / 150) * 100, rounded to nearest integer

**Full Assessment (Section 7 included):**
- Raw Total = sum of Sections 1-7 (max 175)
- Overall Score = (Raw Total / 175) * 100, rounded to nearest integer

### Readiness Tiers
- **85-100: MSP Program Ready** (Green #2D8C46) - "Strong foundation. Focus on program design, recruitment, and distributor placement."
- **65-84: MSP Capable** (Teal #1A8A7D) - "Good product-market fit with targeted gaps to close before launch."
- **45-64: MSP Emerging** (Amber #D97706) - "Product has potential but requires meaningful foundational work."
- **Below 45: MSP Premature** (Red #DC2626) - "Significant gaps. Focus on product maturity before pursuing MSP distribution."

### Red Flag Detection
Flag these regardless of overall score:
- Section 1, Q1 (Multi-Tenant) scored 1 or 2: "Critical: No multi-tenant management. MSPs will not adopt a product that requires separate logins per client."
- Section 1, Q2 (API/Integration) scored 1 or 2: "Critical: No PSA/RMM integrations. MSPs can't connect your product to their operational backbone."
- Section 2, Q1 (Pricing) scored 1 or 2: "Critical: Pricing model isn't built for MSP economics. Partners can't make the math work."
- Section 3, Q2 (Channel Conflict) scored 1 or 2: "Critical: No channel conflict resolution. Your direct sales team will destroy partner trust."
- Section 3, Q1 (Executive Commitment) scored 1 or 2: "Critical: No executive commitment to a 12+ month investment. The program will be killed before it can produce results."

---

## FINANCIAL IMPACT MODELING

Use the financial data from the financials screen. Where optional fields are blank, use benchmarks:
- Sales cycle: 45 days direct, 30 days through MSP
- CAC: if blank, (ARR * 0.15) / customer count, floor $5,000
- Average MSP manages 75 clients
- MSP channel reduces CAC by 40-60%
- MSP channel reduces sales cycle by 30-40%
- MSP-sourced deals have 15-20% higher retention

### 3-Year Channel Revenue Projection

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active MSP Partners | 12 | 30 | 60 |
| Avg Clients per Partner | 3 | 8 | 12 |
| Total MSP Clients | 36 | 240 | 720 |
| MSP Revenue | 36 * ACV | 240 * ACV | 720 * ACV |
| MSP Revenue as % of ARR | calculated | calculated | calculated |

### Cost of Delay (12-month wait)
- Revenue delay: Year 1 MSP revenue pushed to Year 2
- Competitive window warning specific to their product category
- CAC impact: quarterly new customers = (ARR * 0.25) / ACV / 4; CAC savings per quarter = quarterly new customers * (direct CAC * 0.5)

### DIY vs. Expert-Guided Build Comparison

**DIY Build (18-24 months):**
- VP/Director Channel hire: $180K-$250K/yr fully loaded
- 1-2 channel managers: $100K-$150K each
- Time to productivity: 6-9 months
- First 18 months cost: $350K-$550K salary + $50K-$100K program costs + lost revenue from mistakes
- Total: $500K-$900K over 18 months, revenue starting month 15-18

**Expert-Guided Build (6-9 months):**
- Engagement: $60K-$200K over 6-9 months
- Internal hire still needed but walks into launch-ready playbook
- Revenue starts month 9-12
- Mistakes avoided save $200K-$400K
- Total: $60K-$200K engagement + hire, revenue 6-9 months sooner

**Common Mistakes Tax (include in PDF):**
1. Wrong pricing model (6 months to discover/fix): ~40% of Year 1 MSP revenue lost
2. Channel conflict (9 months to surface/resolve): 30-50% of early partners disengage permanently
3. Wrong partner recruitment (70% never activate): $2K-$5K wasted per inactive partner
4. No distributor strategy (12 months to course-correct): miss 60-70% of addressable partner base
5. End-user enablement instead of MSP enablement (6-9 months of rework)

---

## PDF REPORT STRUCTURE

Generate a professional, multi-page PDF using @react-pdf/renderer. Brand colors, clean layout, generous whitespace. Executive-grade.

**Page 1: Cover**
- Title: "MSP Channel Readiness Assessment"
- Subtitle: "Prepared for [Company Name]"
- Date
- Prepared by: Jon Purcell | Untapped Channel Strategy
- Website: untappedchannelstrategy.com

**Page 2: Executive Summary**
- Overall score (large, with tier label and color)
- **AI-GENERATED:** 3-4 sentence executive summary: what the score means, biggest opportunity, biggest blocker
- Red flags section (if any, from deterministic detection)
- **AI-GENERATED:** One-line recommendation tailored to their specific score pattern

**Pages 3-4: Section Scores Breakdown**
For each section:
- Section name and score (e.g., "Product Architecture: 18/25")
- Visual bar showing score relative to max
- **AI-GENERATED:** 2-3 sentence interpretation referencing specific strengths and gaps by question name
- Strengths (questions scored 4-5) listed by name
- Gaps (questions scored 1-2) listed by name
- **AI-GENERATED:** One actionable recommendation per section

**Page 5: Financial Impact Analysis**
- 3-year MSP revenue projection table (deterministic calculation)
- Current trajectory vs. trajectory with MSP channel
- Key stats: Year 3 MSP revenue, CAC reduction, sales cycle improvement
- **AI-GENERATED:** 2-3 sentence commentary contextualizing projections for their specific situation

**Page 6: Cost of Delay**
- Revenue impact of waiting 12 months (deterministic calculation)
- CAC premium without MSP distribution (deterministic calculation)
- **AI-GENERATED:** 2-3 sentence narrative specific to their product category and competitive landscape
- Key stat: "Every quarter without an MSP channel costs approximately $X in higher acquisition costs and $Y in unrealized partner revenue."

**Page 7: DIY vs. Expert-Guided Build**
- Side-by-side comparison: timeline, cost, revenue start, risk level
- Common Mistakes Tax breakdown with estimates
- Key insight: "The engagement doesn't replace your internal hire. It gives them a launch-ready playbook instead of a 12-month learning curve."

**Page 8: Timeline to Launch**
Based on tier:
- MSP Program Ready (85-100): 3-4 months
- MSP Capable (65-84): 4-6 months
- MSP Emerging (45-64): 6-9 months
- MSP Premature (Below 45): 12+ months
Visual timeline or phased roadmap.
- **AI-GENERATED:** 3-4 sentence roadmap narrative describing their specific path, which gaps to close first, and in what order

**Page 9: Next Steps / CTA**
- Headline: "What Comes Next"
- Offer: complimentary 90-minute deep-dive assessment. "No cost, no obligation. You'll walk away with actionable insight whether or not we work together."
- Contact: Jon Purcell
- Untapped Channel Strategy
- untappedchannelstrategy.com
- Book a call: [BOOKING LINK]
- Closing: "Built Apple's MSP program from zero. Rebuilding Workiva's. 9 years in VMware's channel organization. I know what works, what doesn't, and how to get you there faster."

---

## EMAIL TEMPLATES

### Email to User (on submission)

**Subject:** Your MSP Channel Readiness Assessment Results: [Score]/100 - [Tier Name]
**From:** Jon Purcell <jon@untappedchannelstrategy.com> (or noreply with reply-to set to Jon)
**Body:**
```
Hi [First Name],

Thank you for completing the MSP Channel Readiness Assessment. Your full report is attached.

Your Score: [Score]/100 - [Tier Name]

[2-sentence summary matching the tier]

The attached PDF includes your section-by-section breakdown, financial impact projections, and a recommended roadmap based on where you scored.

If you'd like to go deeper, I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build a customized action plan. No cost, no obligation.

Book your deep-dive: [BOOKING LINK]

Jon Purcell
Untapped Channel Strategy
untappedchannelstrategy.com
```
**Attachment:** The PDF report

### Email to Admin (jon@untappedchannelstrategy.com)

**Subject:** New Assessment: [Company Name] - [Score]/100 ([Tier Name])
**Body:**
```
New MSP Channel Readiness Assessment Completed

Contact Info:
- Name: [Full Name]
- Title: [Title]
- Company: [Company Name]
- Website: [Website]
- Email: [Email]
- Phone: [Phone]
- Product Category: [Category]

Financial Data:
- ARR: $[ARR]
- ACV: $[ACV]
- Customers: [Count]
- Direct Revenue %: [%]
- Sales Cycle: [days]
- CAC: $[CAC]
- Existing MSP Relationships: [Yes/No/Not sure]

Scores:
- Overall: [Score]/100 ([Tier])
- Section 1 (Product): [X]/25
- Section 2 (Pricing): [X]/25
- Section 3 (Organization): [X]/25
- Section 4 (Ecosystem): [X]/25
- Section 5 (Enablement): [X]/25
- Section 6 (Competitive): [X]/25
- Section 7 (Channel Health): [X]/25 or "Skipped (Greenfield)"

Red Flags: [list or "None"]

Submitted: [timestamp]
```
**Attachment:** Same PDF report

---

## ADMIN DASHBOARD (/admin)

### Authentication
Simple password protection using an environment variable (ADMIN_PASSWORD). Show a login form that checks the password. Use a cookie/session to persist auth for the browser session. No need for a full auth system.

### Dashboard View
- Table showing all submissions, sorted by most recent first
- Columns: Date, Name, Company, Email, Phone, Score, Tier
- Click a row to expand or navigate to a detail view showing: all contact info, all scores with section breakdown, all financial inputs, red flags, and a button to re-download the PDF
- Search/filter by company name or email
- Export to CSV button

---

## DATABASE SCHEMA (Supabase)

```sql
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_website TEXT,
  product_category TEXT NOT NULL,
  
  -- Financial Data
  arr NUMERIC,
  acv NUMERIC,
  customer_count INTEGER,
  direct_revenue_pct NUMERIC,
  sales_cycle_days INTEGER,
  cac NUMERIC,
  existing_msp_relationships TEXT, -- 'yes', 'no', 'not_sure'
  
  -- Section Scores (store individual question scores as JSON)
  section_1_scores JSONB, -- {q1: 3, q2: 4, q3: 2, q4: 5, q5: 3}
  section_2_scores JSONB,
  section_3_scores JSONB,
  section_4_scores JSONB,
  section_5_scores JSONB,
  section_6_scores JSONB,
  section_7_scores JSONB, -- null if skipped
  section_7_skipped BOOLEAN DEFAULT FALSE,
  
  -- Calculated Results
  section_1_total INTEGER,
  section_2_total INTEGER,
  section_3_total INTEGER,
  section_4_total INTEGER,
  section_5_total INTEGER,
  section_6_total INTEGER,
  section_7_total INTEGER,
  overall_score INTEGER,
  readiness_tier TEXT, -- 'ready', 'capable', 'emerging', 'premature'
  red_flags JSONB, -- array of flag strings
  
  -- PDF
  pdf_url TEXT, -- store the generated PDF URL (Supabase storage or similar)
  
  -- AI-Generated Narrative (stored so we don't re-generate on PDF re-download)
  ai_narrative JSONB -- {executive_summary, section_interpretations[], financial_commentary, roadmap_narrative, cost_of_delay_narrative}
);
```

---

## ENVIRONMENT VARIABLES NEEDED

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
ADMIN_PASSWORD=
BOOKING_URL=
```

---

## AI-GENERATED NARRATIVE (Claude API Integration)

### Purpose

The scoring is deterministic (math). But the written interpretations in the PDF report are where the real value lives. Instead of templated fill-in-the-blank paragraphs, use the Anthropic Claude API to generate personalized, insightful narrative content for each report. This makes every PDF feel like Jon personally reviewed their assessment, not like a generic quiz output.

A vendor scoring 72 with a 1 on multi-tenancy and a 5 on executive commitment has a completely different story than a vendor scoring 72 with strong product but weak organizational readiness. The AI captures that nuance.

### What the AI Generates (and what it does NOT)

**AI generates these PDF sections:**
1. **Executive Summary** (Page 2): 3-4 sentences interpreting the overall score, identifying the single biggest opportunity and the single biggest blocker, and giving a one-line recommendation. This should read like an experienced channel consultant's assessment, not a chatbot summary.
2. **Section Interpretations** (Pages 3-4): For each of the 6-7 sections, a 2-3 sentence interpretation of what the score means in context. Should reference specific strengths (questions scored 4-5) and gaps (questions scored 1-2) by name, and give one actionable recommendation per section.
3. **Financial Commentary** (Page 5): 2-3 sentences contextualizing the financial projections based on their ARR, ACV, category, and score. Should feel grounded, not hype-y.
4. **Cost of Delay Narrative** (Page 6): 2-3 sentences specific to their product category and competitive landscape score, explaining why waiting has a real cost. Reference their specific category dynamics.
5. **Roadmap Narrative** (Page 8): 3-4 sentences describing their recommended path based on tier, with specific references to which gaps they should close first and in what order.

**AI does NOT generate:**
- Scores (deterministic math, calculated client-side and server-side)
- Financial projections (deterministic formulas)
- Red flag detection (conditional logic)
- The DIY vs. Expert comparison data (static content with calculated dollar figures)
- Any CTA or sales language (that stays templated and consistent)

### Implementation: Server-Side API Route

Create a Next.js API route: `/api/generate-narrative`

This route is called server-side AFTER scoring is complete and BEFORE the PDF is generated. It should:

1. Accept the full assessment payload (contact info, scores, financial data, red flags, tier)
2. Call the Anthropic Claude API with a structured prompt
3. Return the generated narrative sections as structured JSON
4. Store the narrative in the database alongside the assessment (so re-downloads don't re-generate)

### Claude API Call Structure

```typescript
// /api/generate-narrative/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Call inside your API route handler
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 3000,
  messages: [
    {
      role: "user",
      content: buildNarrativePrompt(assessmentData)
    }
  ],
  system: SYSTEM_PROMPT
});
```

### System Prompt for Narrative Generation

```typescript
const SYSTEM_PROMPT = `You are a senior MSP channel strategy consultant writing personalized assessment report narratives for B2B software vendors evaluating MSP program readiness.

Your voice is direct, confident, and specific. You speak from deep experience designing MSP channel programs. You are not academic, not salesy, and not generic. You sound like a trusted advisor who has built these programs 50 times and knows exactly what matters.

Rules:
- Never use em dashes. Use commas, periods, colons, or separate sentences.
- Never use generic filler language like "in today's competitive landscape" or "it's important to note."
- Be specific. Reference actual MSP ecosystem dynamics: Pax8, ConnectWise, IT Nation, PSA/RMM integrations, multi-tenant architecture, partner activation rates.
- When identifying gaps, name the specific question/dimension and explain why it matters to MSPs in concrete operational terms.
- When identifying strengths, acknowledge them briefly but spend more time on what to do next.
- Financial commentary should feel grounded and conservative. Label assumptions. Credibility over big numbers.
- Keep the tone of someone who wants to help but will be honest about what they see.
- Write in second person ("your product," "your organization").
- Each section should be 2-4 sentences. Concise and punchy, not lengthy paragraphs.

You will receive the full assessment data as structured JSON and must return your narrative as structured JSON matching the specified output format.`;
```

### Input Prompt Builder

```typescript
function buildNarrativePrompt(data: AssessmentData): string {
  return `Generate personalized PDF report narratives for this MSP Channel Readiness Assessment.

ASSESSMENT DATA:
- Company: ${data.companyName}
- Product Category: ${data.productCategory}
- Title of Person: ${data.title}
- Overall Score: ${data.overallScore}/100
- Readiness Tier: ${data.readinessTier}
- Section 7 Skipped: ${data.section7Skipped} (true = greenfield, no existing MSP program)

SECTION SCORES (each out of 25):
- Section 1 (MSP-Ready Product Architecture): ${data.section1Total}/25
  Individual: Multi-Tenant=${data.s1.q1}, API/Integrations=${data.s1.q2}, Provisioning=${data.s1.q3}, White-Label=${data.s1.q4}, Reporting=${data.s1.q5}
- Section 2 (Pricing & Partner Economics): ${data.section2Total}/25
  Individual: Pricing Structure=${data.s2.q1}, Margins=${data.s2.q2}, Billing=${data.s2.q3}, Recurring Revenue=${data.s2.q4}, Cost to Deliver=${data.s2.q5}
- Section 3 (Organizational & GTM Readiness): ${data.section3Total}/25
  Individual: Executive Commitment=${data.s3.q1}, Channel Conflict=${data.s3.q2}, Dedicated Resources=${data.s3.q3}, Roadmap Responsiveness=${data.s3.q4}, GTM Clarity=${data.s3.q5}
- Section 4 (Partner Ecosystem & Recruitment): ${data.section4Total}/25
  Individual: Category Demand=${data.s4.q1}, Distributors=${data.s4.q2}, Community Visibility=${data.s4.q3}, Existing Relationships=${data.s4.q4}, Competitive Advantage=${data.s4.q5}
- Section 5 (Enablement & Partner Experience): ${data.section5Total}/25
  Individual: Onboarding=${data.s5.q1}, Sales Enablement=${data.s5.q2}, Training/Cert=${data.s5.q3}, Partner Support=${data.s5.q4}, NFR/Demo=${data.s5.q5}
- Section 6 (Competitive & Distribution Landscape): ${data.section6Total}/25
  Individual: Competitor Programs=${data.s6.q1}, Distributor Gaps=${data.s6.q2}, Ecosystem Fit=${data.s6.q3}, MSP Differentiation=${data.s6.q4}, Market Timing=${data.s6.q5}
${data.section7Skipped ? '' : `- Section 7 (Existing Channel Health): ${data.section7Total}/25
  Individual: Activation Rate=${data.s7.q1}, Revenue Concentration=${data.s7.q2}, Retention=${data.s7.q3}, Time to First Client=${data.s7.q4}, Satisfaction=${data.s7.q5}`}

RED FLAGS DETECTED: ${data.redFlags.length > 0 ? data.redFlags.join('; ') : 'None'}

FINANCIAL DATA:
- ARR: $${data.arr}
- ACV: $${data.acv}
- Customer Count: ${data.customerCount}
- Direct Sales %: ${data.directRevenuePct}%
- Sales Cycle: ${data.salesCycleDays} days
- CAC: $${data.cac}
- Existing MSP Relationships: ${data.existingMspRelationships}

Respond with ONLY valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{
  "executive_summary": "3-4 sentences. What the overall score means, single biggest opportunity, single biggest blocker, one-line recommendation.",
  "section_interpretations": [
    {
      "section_number": 1,
      "section_name": "MSP-Ready Product Architecture",
      "interpretation": "2-3 sentences interpreting this section score. Reference specific strengths and gaps by question name.",
      "recommendation": "One specific, actionable recommendation for this section."
    },
    // ... repeat for sections 2-6 (and 7 if not skipped)
  ],
  "financial_commentary": "2-3 sentences contextualizing the 3-year projections for their specific ARR, ACV, category, and readiness level.",
  "cost_of_delay_narrative": "2-3 sentences specific to their product category and competitive score about why waiting costs real money.",
  "roadmap_narrative": "3-4 sentences describing their recommended path. Which gaps to close first, in what order, and what the realistic timeline looks like."
}`;
}
```

### Output Handling

```typescript
// Parse the Claude response
const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
const narrative = JSON.parse(aiText) as NarrativeOutput;

// Store in database
await supabase.from('assessments').update({ ai_narrative: narrative }).eq('id', assessmentId);

// Pass to PDF generator
const pdfBuffer = await generatePDF({ ...assessmentData, narrative });
```

### Fallback Strategy

If the Claude API call fails (timeout, rate limit, API error), fall back to templated narratives. Build a `generateFallbackNarrative()` function that uses conditional logic to produce reasonable (if less personalized) text for each section. This ensures reports are always delivered even if the AI call fails.

```typescript
async function getNarrative(data: AssessmentData): Promise<NarrativeOutput> {
  try {
    const response = await fetch('/api/generate-narrative', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API failed');
    return await response.json();
  } catch (error) {
    console.error('AI narrative failed, using fallback:', error);
    return generateFallbackNarrative(data);
  }
}
```

The fallback function should use the same tier-based language guidance from the PDF section:
- High scores (20-25): "Your [area] is a competitive advantage. MSPs will notice."
- Mid scores (13-19): "Solid foundation, but MSPs will compare you to vendors who've nailed this."
- Low scores (5-12): "This is a blocker. No amount of partner recruitment will overcome a gap here. Fix this first."

### Performance & Cost Considerations

- Claude Sonnet is fast (typically 2-4 seconds for this payload) and inexpensive (~$0.01-0.03 per assessment)
- The narrative generation runs server-side in parallel with other submission tasks (saving to DB, etc.)
- Generated narratives are stored in the database, so re-downloading a PDF never re-generates
- The results teaser page can show the deterministic scores immediately while the AI generates in the background, then the full PDF with AI narrative is attached to the email
- Set a timeout of 15 seconds on the API call with fallback to templates

### Flow Integration

The submission flow on the results page becomes:

1. User clicks "See My Results" on financials page
2. Client calculates scores deterministically (instant)
3. Results teaser page displays immediately with scores, tier, and bar chart
4. Simultaneously, server-side:
   a. Save submission to Supabase
   b. Call Claude API for narrative generation (2-4 seconds)
   c. Generate PDF with AI narrative (or fallback if AI fails)
   d. Send email to user with PDF
   e. Send email to admin with PDF + data
5. Results page shows: "Your full report is being generated and will arrive in your inbox shortly."
6. Email typically arrives within 10-30 seconds of submission

---

## DESIGN NOTES

1. **Speed matters.** Target 8-10 minutes. Don't make users scroll excessively. 5 questions per section with clean card-style selection.
2. **Progress indicator** on every assessment screen. "Section 3 of 7" or a visual progress bar.
3. **Tone throughout:** direct and confident. Not academic. Not salesy. Think trusted advisor who has done this 50 times.
4. **PDF quality:** should look like a premium consulting deliverable. Professional layout, clean typography, strategic color use, data visualizations.
5. **Mobile-responsive.** Users will likely start on desktop but may share the PDF on mobile.
6. **Financial projections should feel grounded,** not hype-y. Conservative estimates, clearly labeled assumptions. Credibility over big numbers.
7. **Never use em dashes** in any content, anywhere.
8. **Question card UX:** Show abbreviated option labels (1-2 lines) with the full description available on hover/expand. Do not display all 5 full paragraphs simultaneously.
9. **Loading state on results:** Show a brief "Generating your report..." animation while the PDF generates and emails send. Don't just flash to results instantly.

---

## BUILD ORDER RECOMMENDATION

Build in this sequence to get a working app fastest:

1. **Project scaffold:** Next.js + Tailwind + TypeScript setup, Zustand store for assessment state
2. **Landing page + lead capture form**
3. **Assessment section component** (reusable for all 7 sections) with question card UI
4. **All 7 section pages** using the reusable component with the question data
5. **Financial context page**
6. **Scoring logic** (pure TypeScript functions, no UI dependency)
7. **Results teaser page** with score display and bar chart
8. **Supabase integration** (schema, save submissions)
9. **PDF generation** with @react-pdf/renderer using fallback/template narratives first
10. **AI narrative generation** via Claude API (/api/generate-narrative route), with fallback function
11. **Wire AI narratives into PDF** (replace template text with AI-generated content)
12. **Email integration** with Resend (user email + admin email with PDF)
13. **Admin dashboard** with password auth
14. **Polish:** animations, loading states, mobile responsiveness, edge cases
