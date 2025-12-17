-- ============================================================================
-- Migration: Backfill 'passed' field for existing attempts
-- ============================================================================
-- This migration updates all existing submitted/expired attempts that have
-- a percent_score but no passed value. It calculates passed status based on
-- comparing percent_score against the exam's pass_mark_percent.
-- ============================================================================

-- Backfill the passed field for all completed attempts
UPDATE public.attempts a
SET passed = (a.percent_score >= e.pass_mark_percent)
FROM public.exams e
WHERE a.exam_id = e.id
  AND a.status IN ('submitted', 'expired')
  AND a.percent_score IS NOT NULL
  AND a.passed IS NULL;

-- Log the update (optional - comment out if not needed)
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.attempts
  WHERE status IN ('submitted', 'expired')
    AND percent_score IS NOT NULL
    AND passed IS NOT NULL;
  
  RAISE NOTICE 'Backfilled passed field for % attempts', updated_count;
END $$;
