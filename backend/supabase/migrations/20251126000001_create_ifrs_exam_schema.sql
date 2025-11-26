-- ============================================================================
-- IRA IFRS 17 Exam System - Database Schema Migration
-- ============================================================================
-- This migration creates the core database schema for the IFRS 17 exam system.
-- Tables: profiles, exams, questions, options, attempts, attempt_answers
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile information
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    organisation TEXT,
    role TEXT NOT NULL DEFAULT 'student' 
        CHECK (role IN ('student', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.role IS 'User role: student, admin, or super_admin';

-- ============================================================================
-- 2. EXAMS TABLE
-- ============================================================================
-- Stores exam definitions with configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    total_marks INTEGER NOT NULL CHECK (total_marks > 0),
    pass_mark_percent INTEGER NOT NULL DEFAULT 60 
        CHECK (pass_mark_percent >= 0 AND pass_mark_percent <= 100),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
    allow_review BOOLEAN NOT NULL DEFAULT TRUE,
    max_attempts INTEGER DEFAULT 1 CHECK (max_attempts IS NULL OR max_attempts > 0),
    instructions TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active exams lookup
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON public.exams(is_active);

-- Index for created_by queries
CREATE INDEX IF NOT EXISTS idx_exams_created_by ON public.exams(created_by);

COMMENT ON TABLE public.exams IS 'Exam definitions with configuration';
COMMENT ON COLUMN public.exams.total_marks IS 'Total marks possible in the exam';
COMMENT ON COLUMN public.exams.pass_mark_percent IS 'Minimum percentage required to pass';
COMMENT ON COLUMN public.exams.max_attempts IS 'Maximum attempts allowed per user (NULL = unlimited)';

-- ============================================================================
-- 3. QUESTIONS TABLE
-- ============================================================================
-- Stores questions belonging to exams
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1 CHECK (marks > 0),
    explanation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique question numbers per exam
    CONSTRAINT unique_question_number_per_exam UNIQUE (exam_id, question_number)
);

-- Index for exam questions lookup
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);

-- Index for active questions
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON public.questions(is_active);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_questions_exam_active ON public.questions(exam_id, is_active);

COMMENT ON TABLE public.questions IS 'Questions belonging to exams';
COMMENT ON COLUMN public.questions.question_number IS 'Order of question within exam';
COMMENT ON COLUMN public.questions.marks IS 'Points awarded for correct answer';
COMMENT ON COLUMN public.questions.explanation IS 'Explanation shown after grading';

-- ============================================================================
-- 4. OPTIONS TABLE
-- ============================================================================
-- Stores answer options for questions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    label TEXT,  -- e.g., "A", "B", "C", "D"
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for question options lookup
CREATE INDEX IF NOT EXISTS idx_options_question_id ON public.options(question_id);

-- Index for display ordering
CREATE INDEX IF NOT EXISTS idx_options_display_order ON public.options(question_id, display_order);

COMMENT ON TABLE public.options IS 'Answer options for questions';
COMMENT ON COLUMN public.options.label IS 'Display label like A, B, C, D';
COMMENT ON COLUMN public.options.is_correct IS 'Whether this is the correct answer';

-- ============================================================================
-- 5. ATTEMPTS TABLE
-- ============================================================================
-- Stores student exam attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    raw_score NUMERIC(10, 2),
    percent_score NUMERIC(5, 2) CHECK (percent_score IS NULL OR (percent_score >= 0 AND percent_score <= 100)),
    passed BOOLEAN,
    status TEXT NOT NULL DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'submitted', 'expired')),
    time_taken_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user attempts lookup
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);

-- Index for exam attempts lookup
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON public.attempts(exam_id);

-- Composite index for user exam attempts
CREATE INDEX IF NOT EXISTS idx_attempts_exam_user ON public.attempts(exam_id, user_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);

-- Index for finding in-progress attempts
CREATE INDEX IF NOT EXISTS idx_attempts_in_progress ON public.attempts(user_id, exam_id, status) 
    WHERE status = 'in_progress';

COMMENT ON TABLE public.attempts IS 'Student exam attempts';
COMMENT ON COLUMN public.attempts.raw_score IS 'Sum of marks for correct answers';
COMMENT ON COLUMN public.attempts.percent_score IS 'Percentage score (0-100)';
COMMENT ON COLUMN public.attempts.expires_at IS 'When the attempt times out';

-- ============================================================================
-- 6. ATTEMPT_ANSWERS TABLE
-- ============================================================================
-- Stores individual answers within an attempt
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    awarded_marks NUMERIC(10, 2),
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one answer per question per attempt
    CONSTRAINT unique_answer_per_question UNIQUE (attempt_id, question_id)
);

-- Index for attempt answers lookup
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);

-- Index for question answers lookup
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON public.attempt_answers(question_id);

COMMENT ON TABLE public.attempt_answers IS 'Individual answers within an attempt';
COMMENT ON COLUMN public.attempt_answers.is_correct IS 'Snapshot of correctness at submit time';
COMMENT ON COLUMN public.attempt_answers.awarded_marks IS 'Marks given for this answer';

-- ============================================================================
-- 7. LEADERBOARD VIEW
-- ============================================================================
-- Shows best attempt per user per exam
-- ============================================================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    a.exam_id,
    a.user_id,
    p.full_name,
    p.organisation,
    MAX(a.percent_score) AS best_percent_score,
    MAX(a.raw_score) AS best_raw_score,
    COUNT(*) AS attempts_count,
    MAX(a.submitted_at) AS last_submitted_at
FROM public.attempts a
INNER JOIN public.profiles p ON a.user_id = p.id
WHERE a.status = 'submitted'
GROUP BY a.exam_id, a.user_id, p.full_name, p.organisation;

COMMENT ON VIEW public.leaderboard IS 'Best attempt per user per exam for leaderboard display';

-- ============================================================================
-- 8. EXAM STATISTICS VIEW
-- ============================================================================
-- Provides aggregate statistics per exam
-- ============================================================================

CREATE OR REPLACE VIEW public.exam_statistics AS
SELECT 
    e.id AS exam_id,
    e.title AS exam_title,
    COUNT(DISTINCT a.user_id) AS total_candidates,
    COUNT(a.id) AS total_attempts,
    COUNT(a.id) FILTER (WHERE a.status = 'submitted') AS submitted_attempts,
    COUNT(a.id) FILTER (WHERE a.passed = TRUE) AS passed_count,
    COUNT(a.id) FILTER (WHERE a.passed = FALSE) AS failed_count,
    ROUND(AVG(a.percent_score) FILTER (WHERE a.status = 'submitted'), 2) AS avg_score,
    MAX(a.percent_score) FILTER (WHERE a.status = 'submitted') AS highest_score,
    MIN(a.percent_score) FILTER (WHERE a.status = 'submitted') AS lowest_score,
    ROUND(
        (COUNT(a.id) FILTER (WHERE a.passed = TRUE)::NUMERIC / 
         NULLIF(COUNT(a.id) FILTER (WHERE a.status = 'submitted'), 0)) * 100, 
        2
    ) AS pass_rate
FROM public.exams e
LEFT JOIN public.attempts a ON e.id = a.exam_id
GROUP BY e.id, e.title;

COMMENT ON VIEW public.exam_statistics IS 'Aggregate statistics per exam for admin dashboard';

-- ============================================================================
-- 9. TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set expires_at based on exam duration
CREATE OR REPLACE FUNCTION public.set_attempt_expires_at()
RETURNS TRIGGER AS $$
DECLARE
    exam_duration INTEGER;
BEGIN
    SELECT duration_minutes INTO exam_duration
    FROM public.exams
    WHERE id = NEW.exam_id;
    
    NEW.expires_at = NEW.started_at + (exam_duration || ' minutes')::INTERVAL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for exams updated_at
DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for questions updated_at
DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for setting attempt expiration
DROP TRIGGER IF EXISTS set_attempt_expires_at_trigger ON public.attempts;
CREATE TRIGGER set_attempt_expires_at_trigger
    BEFORE INSERT ON public.attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_attempt_expires_at();

-- Trigger for auto-creating profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role(user_id) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role(user_id) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count user attempts for an exam
CREATE OR REPLACE FUNCTION public.count_user_attempts(p_user_id UUID, p_exam_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.attempts
        WHERE user_id = p_user_id 
        AND exam_id = p_exam_id
        AND status IN ('submitted', 'in_progress')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can start exam
CREATE OR REPLACE FUNCTION public.can_start_exam(p_user_id UUID, p_exam_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    exam_record RECORD;
    attempt_count INTEGER;
    has_in_progress BOOLEAN;
BEGIN
    -- Get exam details
    SELECT is_active, max_attempts INTO exam_record
    FROM public.exams
    WHERE id = p_exam_id;
    
    -- Check if exam exists and is active
    IF exam_record IS NULL OR NOT exam_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Check for existing in-progress attempt
    SELECT EXISTS(
        SELECT 1 FROM public.attempts
        WHERE user_id = p_user_id 
        AND exam_id = p_exam_id 
        AND status = 'in_progress'
    ) INTO has_in_progress;
    
    -- If there's an in-progress attempt, they can continue it
    IF has_in_progress THEN
        RETURN TRUE;
    END IF;
    
    -- Check attempt limit
    IF exam_record.max_attempts IS NOT NULL THEN
        SELECT COUNT(*) INTO attempt_count
        FROM public.attempts
        WHERE user_id = p_user_id 
        AND exam_id = p_exam_id
        AND status = 'submitted';
        
        IF attempt_count >= exam_record.max_attempts THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT ON public.exams TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.exams TO authenticated;

GRANT SELECT ON public.questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;

GRANT SELECT ON public.options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.options TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.attempts TO authenticated;
GRANT DELETE ON public.attempts TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.attempt_answers TO authenticated;
GRANT DELETE ON public.attempt_answers TO authenticated;

-- Grant access to views
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.exam_statistics TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_user_attempts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_start_exam(UUID, UUID) TO authenticated;
