-- ============================================================================
-- Update Exam Settings
-- ============================================================================
-- This migration updates the exam configuration:
-- 1. Enable question randomization for each candidate
-- 2. Update duration to 70 minutes (1 hour 10 minutes)
-- 3. Ensure allow_review is TRUE so candidates see answers after submission
-- ============================================================================

UPDATE public.exams
SET 
    duration_minutes = 70,          -- Changed from 60 to 70 minutes
    randomize_questions = TRUE,     -- Enable random question order for each candidate
    allow_review = TRUE             -- Ensure candidates can review answers after exam
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Verify the update
DO $$
DECLARE
    v_duration INTEGER;
    v_randomize BOOLEAN;
    v_review BOOLEAN;
BEGIN
    SELECT duration_minutes, randomize_questions, allow_review 
    INTO v_duration, v_randomize, v_review
    FROM public.exams 
    WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    RAISE NOTICE 'Exam settings updated:';
    RAISE NOTICE '  Duration: % minutes', v_duration;
    RAISE NOTICE '  Randomize Questions: %', v_randomize;
    RAISE NOTICE '  Allow Review: %', v_review;
    
    IF v_duration != 70 THEN
        RAISE EXCEPTION 'Expected duration_minutes to be 70, found %', v_duration;
    END IF;
    
    IF v_randomize != TRUE THEN
        RAISE EXCEPTION 'Expected randomize_questions to be TRUE';
    END IF;
    
    IF v_review != TRUE THEN
        RAISE EXCEPTION 'Expected allow_review to be TRUE';
    END IF;
    
    RAISE NOTICE 'Exam settings verification passed!';
END $$;
