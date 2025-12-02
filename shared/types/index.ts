/**
 * Shared TypeScript types for the IRA IFRS 17 Exam application.
 * Used by both frontend-user and frontend-admin.
 */

// User roles
export type UserRole = 'student' | 'admin' | 'super_admin';

// Attempt status
export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

/**
 * User profile extending Supabase auth.users
 */
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  organisation?: string;
  role: UserRole;
  created_at: string | Date;
}

/**
 * Exam definition
 */
export interface Exam {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  total_marks: number;
  duration_minutes: number;
  randomize_questions: boolean;
  created_by?: string;
  created_at: string | Date;
}

/**
 * Question (client-safe version without is_correct on options)
 */
export interface Question {
  id: string;
  exam_id: string;
  question_number: number;
  prompt: string;
  marks: number;
  explanation?: string;
  is_active: boolean;
  created_at: string | Date;
  options?: Option[];
}

/**
 * Option for a question (client-safe, no is_correct)
 */
export interface Option {
  id: string;
  question_id: string;
  label?: string;
  text: string;
  created_at: string | Date;
}

/**
 * Admin version of Option with is_correct flag
 */
export interface AdminOption extends Option {
  is_correct: boolean;
}

/**
 * Admin version of Question with AdminOptions
 */
export interface AdminQuestion extends Omit<Question, 'options'> {
  options?: AdminOption[];
}

/**
 * Exam attempt by a student
 */
export interface Attempt {
  id: string;
  exam_id: string;
  user_id: string;
  started_at: string | Date;
  submitted_at?: string | Date;
  raw_score?: number;
  percent_score?: number;
  status: AttemptStatus;
}

/**
 * Individual answer within an attempt
 */
export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  is_correct?: boolean;
  awarded_marks?: number;
  created_at: string | Date;
}

/**
 * Review data returned after submitting an exam
 */
export interface QuestionReview {
  question_id: string;
  question_number: number;
  prompt: string;
  marks: number;
  explanation?: string;
  options: {
    id: string;
    label?: string;
    text: string;
    is_correct: boolean;
  }[];
  selected_option_id?: string;
  is_correct: boolean;
  awarded_marks: number;
}

/**
 * Result of submitting an exam
 */
export interface ExamResult {
  attempt_id: string;
  exam_id: string;
  exam_title: string;
  raw_score: number;
  total_marks: number;
  percent_score: number;
  submitted_at: string | Date;
  questions: QuestionReview[];
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  exam_id: string;
  user_id: string;
  full_name?: string;
  organisation?: string;
  best_percent_score: number;
  best_raw_score: number;
  attempts_count: number;
  last_submitted_at: string | Date;
}

/**
 * Start exam response from Edge Function
 */
export interface StartExamResponse {
  attempt: Attempt;
  exam: Pick<Exam, 'id' | 'title' | 'duration_minutes' | 'total_marks'>;
  questions: Question[];
}

/**
 * Submit exam request to Edge Function
 */
export interface SubmitExamRequest {
  attemptId: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
