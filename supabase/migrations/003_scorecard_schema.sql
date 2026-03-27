-- Drop old columns if they exist
ALTER TABLE assessments
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS company_website,
  DROP COLUMN IF EXISTS product_category,
  DROP COLUMN IF EXISTS arr,
  DROP COLUMN IF EXISTS acv,
  DROP COLUMN IF EXISTS customer_count,
  DROP COLUMN IF EXISTS direct_revenue_pct,
  DROP COLUMN IF EXISTS sales_cycle_days,
  DROP COLUMN IF EXISTS cac,
  DROP COLUMN IF EXISTS existing_msp_relationships,
  DROP COLUMN IF EXISTS section_1_scores,
  DROP COLUMN IF EXISTS section_2_scores,
  DROP COLUMN IF EXISTS section_3_scores,
  DROP COLUMN IF EXISTS section_4_scores,
  DROP COLUMN IF EXISTS section_5_scores,
  DROP COLUMN IF EXISTS section_6_scores,
  DROP COLUMN IF EXISTS section_7_scores,
  DROP COLUMN IF EXISTS section_7_skipped,
  DROP COLUMN IF EXISTS overall_score,
  DROP COLUMN IF EXISTS readiness_tier,
  DROP COLUMN IF EXISTS red_flags,
  DROP COLUMN IF EXISTS pdf_url,
  DROP COLUMN IF EXISTS ai_narrative;

-- Add new columns
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS vertical TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB,
  ADD COLUMN IF NOT EXISTS scores JSONB,
  ADD COLUMN IF NOT EXISTS output JSONB;
