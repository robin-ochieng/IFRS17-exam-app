-- Migration: Update IFRS 17 Exam duration to 45 minutes
-- Date: 2025-12-08
-- Description: Changes exam duration from 70 minutes to 45 minutes

-- 1. Update duration to 45 minutes
UPDATE public.exams
SET 
    duration_minutes = 45,
    updated_at = NOW()
WHERE title LIKE '%IFRS 17%';

-- 2. Update the exam instructions to reflect new duration
UPDATE public.exams
SET 
    instructions = E'Welcome to the IRA IFRS 17 Assessment Exam.\n\nInstructions:\n1. You have 45 minutes to complete this exam.\n2. Read each question carefully before selecting your answer.\n3. You can navigate between questions using the question panel.\n4. Your answers are automatically saved.\n5. You can mark questions for review and return to them later.\n6. Once you submit the exam, you cannot change your answers.\n\nGood luck!',
    updated_at = NOW()
WHERE title LIKE '%IFRS 17%';

-- 3. Verification
DO $$
DECLARE
    v_duration INTEGER;
BEGIN
    SELECT duration_minutes 
    INTO v_duration
    FROM public.exams 
    WHERE title LIKE '%IFRS 17%'
    LIMIT 1;
    
    RAISE NOTICE 'Updated IFRS 17 Exam Settings:';
    RAISE NOTICE '  Duration: % minutes', v_duration;
    
    IF v_duration != 45 THEN
        RAISE EXCEPTION 'Expected duration_minutes to be 45, found %', v_duration;
    END IF;
    
    RAISE NOTICE 'Verification passed: Duration successfully updated to 45 minutes';
END $$;
