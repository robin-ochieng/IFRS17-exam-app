-- ============================================================================
-- IRA IFRS 17 Exam System - Fix Question Marks
-- ============================================================================
-- This migration fixes the question marks distribution to ensure 35 questions
-- add up to exactly 100 marks.
-- 
-- Problem: Questions were assigned 3 marks each (35 × 3 = 105 marks)
-- Solution: Redistribute marks so they sum to exactly 100
-- 
-- Algorithm:
--   Base mark per question: 100 / 35 = 2.857142857...
--   We'll use: 2.86 marks × 30 questions = 85.80
--              2.80 marks × 5 questions  = 14.00
--              Total = 99.80 (need 0.20 more)
--   
--   Better approach: 
--              2.86 marks × 33 questions = 94.38
--              2.82 marks × 2 questions  = 5.64
--              Total = 100.02 (too high)
--
--   Final approach (exact 100):
--              2.86 marks × 25 questions = 71.50
--              2.85 marks × 10 questions = 28.50
--              Total = 100.00 ✓
-- ============================================================================

-- ============================================================================
-- 1. UPDATE EXAM TOTAL MARKS
-- ============================================================================

UPDATE public.exams
SET 
    total_marks = 100,
    updated_at = NOW()
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================================================
-- 2. UPDATE QUESTION MARKS
-- ============================================================================
-- Distribution: Questions 1-25 get 2.86 marks, Questions 26-35 get 2.85 marks
-- Total: (25 × 2.86) + (10 × 2.85) = 71.50 + 28.50 = 100.00

-- Update questions 1-25 to 2.86 marks
UPDATE public.questions
SET 
    marks = 2.86,
    updated_at = NOW()
WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND question_number BETWEEN 1 AND 25;

-- Update questions 26-35 to 2.85 marks
UPDATE public.questions
SET 
    marks = 2.85,
    updated_at = NOW()
WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND question_number BETWEEN 26 AND 35;

-- ============================================================================
-- 3. RECALCULATE EXISTING ATTEMPT SCORES
-- ============================================================================
-- Step 1: Update awarded_marks in attempt_answers based on new question marks

UPDATE public.attempt_answers aa
SET awarded_marks = CASE 
    WHEN aa.is_correct = TRUE THEN q.marks 
    ELSE 0 
END
FROM public.questions q
WHERE aa.question_id = q.id
  AND q.exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Step 2: Recalculate raw_score and percent_score for all attempts of this exam
-- Using a CTE to calculate the new scores first, then update
WITH recalculated_scores AS (
    SELECT 
        a.id as attempt_id,
        COALESCE(SUM(aa.awarded_marks), 0) as new_raw_score
    FROM public.attempts a
    LEFT JOIN public.attempt_answers aa ON aa.attempt_id = a.id
    WHERE a.exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      AND a.status = 'submitted'
    GROUP BY a.id
)
UPDATE public.attempts a
SET 
    raw_score = rs.new_raw_score,
    percent_score = LEAST(ROUND(rs.new_raw_score, 2), 100) -- Cap at 100 to satisfy constraint
FROM recalculated_scores rs
WHERE a.id = rs.attempt_id;

-- ============================================================================
-- 4. VERIFICATION QUERY (for manual check)
-- ============================================================================
-- Run this query to verify the fix:
-- 
-- SELECT 
--     SUM(marks) as total_marks,
--     COUNT(*) as question_count,
--     AVG(marks) as avg_marks_per_question
-- FROM public.questions 
-- WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
--   AND is_active = TRUE;
--
-- Expected result: total_marks = 100.00, question_count = 35

-- ============================================================================
-- 5. RAISE NOTICE FOR VERIFICATION
-- ============================================================================
DO $$
DECLARE
    total_q_marks NUMERIC;
    q_count INTEGER;
BEGIN
    SELECT SUM(marks), COUNT(*) 
    INTO total_q_marks, q_count
    FROM public.questions 
    WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      AND is_active = TRUE;
    
    RAISE NOTICE 'Question marks verification: % questions totaling % marks', q_count, total_q_marks;
    
    IF total_q_marks != 100 THEN
        RAISE WARNING 'Total marks (%) does not equal 100!', total_q_marks;
    END IF;
END $$;
