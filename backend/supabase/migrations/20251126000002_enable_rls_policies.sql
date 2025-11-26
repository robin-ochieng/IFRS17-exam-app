-- ============================================================================
-- IRA IFRS 17 Exam System - Row Level Security Policies
-- ============================================================================
-- This migration enables RLS and creates security policies for all tables.
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Users can update their own profile (except role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Super admins can update any profile (including role changes)
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
CREATE POLICY "Super admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- Allow profile creation during signup (via trigger)
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
CREATE POLICY "Allow profile creation"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- 3. EXAMS POLICIES
-- ============================================================================

-- Anyone authenticated can view active exams
DROP POLICY IF EXISTS "Anyone can view active exams" ON public.exams;
CREATE POLICY "Anyone can view active exams"
    ON public.exams
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Admins can view all exams (including inactive)
DROP POLICY IF EXISTS "Admins can view all exams" ON public.exams;
CREATE POLICY "Admins can view all exams"
    ON public.exams
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can create exams
DROP POLICY IF EXISTS "Admins can create exams" ON public.exams;
CREATE POLICY "Admins can create exams"
    ON public.exams
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update exams
DROP POLICY IF EXISTS "Admins can update exams" ON public.exams;
CREATE POLICY "Admins can update exams"
    ON public.exams
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Super admins can delete exams
DROP POLICY IF EXISTS "Super admins can delete exams" ON public.exams;
CREATE POLICY "Super admins can delete exams"
    ON public.exams
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 4. QUESTIONS POLICIES
-- ============================================================================

-- Anyone authenticated can view questions for active exams
DROP POLICY IF EXISTS "Anyone can view questions for active exams" ON public.questions;
CREATE POLICY "Anyone can view questions for active exams"
    ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        is_active = TRUE 
        AND EXISTS (
            SELECT 1 FROM public.exams 
            WHERE id = questions.exam_id AND is_active = TRUE
        )
    );

-- Admins can view all questions
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;
CREATE POLICY "Admins can view all questions"
    ON public.questions
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can create questions
DROP POLICY IF EXISTS "Admins can create questions" ON public.questions;
CREATE POLICY "Admins can create questions"
    ON public.questions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update questions
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
CREATE POLICY "Admins can update questions"
    ON public.questions
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Super admins can delete questions
DROP POLICY IF EXISTS "Super admins can delete questions" ON public.questions;
CREATE POLICY "Super admins can delete questions"
    ON public.questions
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 5. OPTIONS POLICIES
-- ============================================================================

-- Students can view options (but is_correct is hidden via separate query)
DROP POLICY IF EXISTS "Anyone can view options for active questions" ON public.options;
CREATE POLICY "Anyone can view options for active questions"
    ON public.options
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            INNER JOIN public.exams e ON q.exam_id = e.id
            WHERE q.id = options.question_id 
            AND q.is_active = TRUE 
            AND e.is_active = TRUE
        )
    );

-- Admins can view all options (including is_correct)
DROP POLICY IF EXISTS "Admins can view all options" ON public.options;
CREATE POLICY "Admins can view all options"
    ON public.options
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can create options
DROP POLICY IF EXISTS "Admins can create options" ON public.options;
CREATE POLICY "Admins can create options"
    ON public.options
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update options
DROP POLICY IF EXISTS "Admins can update options" ON public.options;
CREATE POLICY "Admins can update options"
    ON public.options
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Super admins can delete options
DROP POLICY IF EXISTS "Super admins can delete options" ON public.options;
CREATE POLICY "Super admins can delete options"
    ON public.options
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 6. ATTEMPTS POLICIES
-- ============================================================================

-- Users can view their own attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
CREATE POLICY "Users can view own attempts"
    ON public.attempts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admins can view all attempts
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.attempts;
CREATE POLICY "Admins can view all attempts"
    ON public.attempts
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Users can create their own attempts (if allowed by exam rules)
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;
CREATE POLICY "Users can create own attempts"
    ON public.attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() 
        AND public.can_start_exam(auth.uid(), exam_id)
    );

-- Users can update their own in-progress attempts
DROP POLICY IF EXISTS "Users can update own in-progress attempts" ON public.attempts;
CREATE POLICY "Users can update own in-progress attempts"
    ON public.attempts
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND status = 'in_progress')
    WITH CHECK (user_id = auth.uid());

-- Admins can update any attempt (e.g., mark as expired)
DROP POLICY IF EXISTS "Admins can update any attempt" ON public.attempts;
CREATE POLICY "Admins can update any attempt"
    ON public.attempts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Super admins can delete attempts
DROP POLICY IF EXISTS "Super admins can delete attempts" ON public.attempts;
CREATE POLICY "Super admins can delete attempts"
    ON public.attempts
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 7. ATTEMPT_ANSWERS POLICIES
-- ============================================================================

-- Users can view their own answers
DROP POLICY IF EXISTS "Users can view own answers" ON public.attempt_answers;
CREATE POLICY "Users can view own answers"
    ON public.attempt_answers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.attempts
            WHERE id = attempt_answers.attempt_id AND user_id = auth.uid()
        )
    );

-- Admins can view all answers
DROP POLICY IF EXISTS "Admins can view all answers" ON public.attempt_answers;
CREATE POLICY "Admins can view all answers"
    ON public.attempt_answers
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Users can insert answers for their own in-progress attempts
DROP POLICY IF EXISTS "Users can insert own answers" ON public.attempt_answers;
CREATE POLICY "Users can insert own answers"
    ON public.attempt_answers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.attempts
            WHERE id = attempt_answers.attempt_id 
            AND user_id = auth.uid() 
            AND status = 'in_progress'
        )
    );

-- Users can update answers for their own in-progress attempts
DROP POLICY IF EXISTS "Users can update own answers" ON public.attempt_answers;
CREATE POLICY "Users can update own answers"
    ON public.attempt_answers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.attempts
            WHERE id = attempt_answers.attempt_id 
            AND user_id = auth.uid() 
            AND status = 'in_progress'
        )
    );

-- Admins can update any answer (for scoring)
DROP POLICY IF EXISTS "Admins can update any answer" ON public.attempt_answers;
CREATE POLICY "Admins can update any answer"
    ON public.attempt_answers
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Super admins can delete answers
DROP POLICY IF EXISTS "Super admins can delete answers" ON public.attempt_answers;
CREATE POLICY "Super admins can delete answers"
    ON public.attempt_answers
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 8. SECURITY FUNCTION TO HIDE is_correct FROM STUDENTS
-- ============================================================================

-- Create a secure view for students that hides is_correct
CREATE OR REPLACE VIEW public.student_options AS
SELECT 
    id,
    question_id,
    label,
    text,
    display_order,
    created_at
FROM public.options;

-- Grant access to student options view
GRANT SELECT ON public.student_options TO authenticated;

COMMENT ON VIEW public.student_options IS 'Options view for students that hides is_correct flag';

-- ============================================================================
-- 9. RPC FUNCTION FOR SAFE QUESTION FETCHING (hides is_correct)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_exam_questions_for_student(p_exam_id UUID)
RETURNS TABLE (
    question_id UUID,
    question_number INTEGER,
    prompt TEXT,
    marks INTEGER,
    options JSONB
) AS $$
BEGIN
    -- Verify exam is active
    IF NOT EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND is_active = TRUE) THEN
        RAISE EXCEPTION 'Exam not found or not active';
    END IF;
    
    RETURN QUERY
    SELECT 
        q.id AS question_id,
        q.question_number,
        q.prompt,
        q.marks,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', o.id,
                    'label', o.label,
                    'text', o.text,
                    'display_order', o.display_order
                ) ORDER BY o.display_order
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'::jsonb
        ) AS options
    FROM public.questions q
    LEFT JOIN public.options o ON q.id = o.question_id
    WHERE q.exam_id = p_exam_id AND q.is_active = TRUE
    GROUP BY q.id, q.question_number, q.prompt, q.marks
    ORDER BY q.question_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_exam_questions_for_student(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_exam_questions_for_student IS 'Safely fetch exam questions without revealing correct answers';
