-- ============================================================================
-- Increase Max Attempts for Testing
-- ============================================================================
-- This migration increases max_attempts to allow re-testing the exam
-- Set to NULL for unlimited attempts, or a specific number like 5
-- ============================================================================

UPDATE public.exams
SET max_attempts = NULL  -- NULL means unlimited attempts
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Alternatively, delete existing attempts for the current user if you want to start fresh
-- DELETE FROM public.attempts WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Verify the update
DO $$
DECLARE
    v_max_attempts INTEGER;
BEGIN
    SELECT max_attempts INTO v_max_attempts
    FROM public.exams 
    WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    IF v_max_attempts IS NULL THEN
        RAISE NOTICE 'max_attempts set to UNLIMITED';
    ELSE
        RAISE NOTICE 'max_attempts set to: %', v_max_attempts;
    END IF;
END $$;
