# Supabase setup for MSP Readiness Assessment

This guide gets the **assessments** table and environment variables in place so the results page can save submissions.

## 1. Create a Supabase project (if needed)

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → pick org, name, database password, region.
3. Wait for the project to finish provisioning.

## 2. Create the `assessments` table

1. In the Supabase dashboard, open your project.
2. Go to **SQL Editor**.
3. New query and paste the schema below, then **Run**.

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
  existing_msp_relationships TEXT,

  -- Section Scores (JSON: {q1: 3, q2: 4, ...})
  section_1_scores JSONB,
  section_2_scores JSONB,
  section_3_scores JSONB,
  section_4_scores JSONB,
  section_5_scores JSONB,
  section_6_scores JSONB,
  section_7_scores JSONB,
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
  readiness_tier TEXT,
  red_flags JSONB,

  -- PDF (filled later)
  pdf_url TEXT,

  -- AI narrative (filled later)
  ai_narrative JSONB
);
```

4. Confirm in **Table Editor** that the `assessments` table exists.

## 3. Get your API keys

1. In the dashboard go to **Project Settings** (gear) → **API**.
2. Note:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**Important:** The service role key bypasses Row Level Security. Never expose it in client-side code or commit it; use it only in server-side code (e.g. API routes).

## 4. Set environment variables locally

1. In the project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and set:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
   ```

3. Restart the Next.js dev server so it picks up the new env vars.

## 5. Deploying (e.g. Vercel)

Add the same three variables in your hosting provider’s environment settings:

- **Vercel:** Project → Settings → Environment Variables. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for the right environments (Production/Preview/Development).

## Verify

1. Run the app and complete the assessment through to the results page.
2. In Supabase **Table Editor** → **assessments**, you should see a new row with the submission data.

---

## Test data (development)

To add sample assessments without running through the full flow:

1. Start the dev server: `npm run dev`
2. In another terminal run: `npm run seed`

This calls `POST /api/dev/seed`, which inserts two test rows (only when `NODE_ENV=development`). You can also open or POST to `http://localhost:3000/api/dev/seed` directly.
