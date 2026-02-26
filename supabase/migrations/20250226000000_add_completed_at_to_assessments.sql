-- Add completed_at to assessments (when the user finished the assessment).
-- Run this in the Supabase SQL Editor if your production DB doesn't have this column yet.

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

COMMENT ON COLUMN assessments.completed_at IS 'When the assessment was completed (submitted). Null until then.';
