export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'admin' | 'super_admin';
export type AttemptStatus = 'in_progress' | 'completed' | 'expired';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          organisation: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          organisation?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          organisation?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          total_marks: number;
          pass_mark_percent: number;
          duration_minutes: number;
          randomize_questions: boolean;
          allow_review: boolean;
          max_attempts: number | null;
          instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          total_marks: number;
          pass_mark_percent?: number;
          duration_minutes?: number;
          randomize_questions?: boolean;
          allow_review?: boolean;
          max_attempts?: number | null;
          instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          total_marks?: number;
          pass_mark_percent?: number;
          duration_minutes?: number;
          randomize_questions?: boolean;
          allow_review?: boolean;
          max_attempts?: number | null;
          instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          question_number: number;
          prompt: string;
          marks: number;
          explanation: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_number: number;
          prompt: string;
          marks?: number;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_number?: number;
          prompt?: string;
          marks?: number;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          text: string;
          is_correct: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          label: string;
          text: string;
          is_correct?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          label?: string;
          text?: string;
          is_correct?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      attempts: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          started_at: string;
          completed_at: string | null;
          expires_at: string;
          score: number | null;
          passed: boolean | null;
          status: AttemptStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          started_at?: string;
          completed_at?: string | null;
          expires_at?: string;
          score?: number | null;
          passed?: boolean | null;
          status?: AttemptStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          started_at?: string;
          completed_at?: string | null;
          expires_at?: string;
          score?: number | null;
          passed?: boolean | null;
          status?: AttemptStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string;
          is_correct: boolean;
          marks_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string;
          is_correct?: boolean;
          marks_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option_id?: string;
          is_correct?: boolean;
          marks_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      student_options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          text: string;
          display_order: number;
        };
      };
      leaderboard: {
        Row: {
          student_id: string;
          full_name: string;
          organisation: string | null;
          exam_id: string;
          exam_title: string;
          best_score: number;
          best_percentage: number;
          attempts_count: number;
          first_attempt: string;
          best_attempt: string;
        };
      };
    };
    Functions: {
      get_user_role: {
        Args: { user_id: string };
        Returns: UserRole;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      can_start_exam: {
        Args: { p_exam_id: string; p_student_id: string };
        Returns: boolean;
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Exam = Database['public']['Tables']['exams']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type Option = Database['public']['Tables']['options']['Row'];
export type Attempt = Database['public']['Tables']['attempts']['Row'];
export type AttemptAnswer = Database['public']['Tables']['attempt_answers']['Row'];

// Extended types for the exam interface
export interface ExamQuestion {
  id: string;
  question_number: number;
  prompt: string;
  marks: number;
  options: ExamOption[];
}

export interface ExamOption {
  id: string;
  label: string;
  text: string;
  display_order: number;
}

export interface ExamAttempt {
  id: string;
  started_at: string;
  expires_at: string;
  status: AttemptStatus;
}

export interface ExamData {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_marks: number;
  allow_review: boolean;
  instructions: string | null;
}

export interface StartExamResponse {
  success: boolean;
  data?: {
    attempt: ExamAttempt;
    exam: ExamData;
    questions: ExamQuestion[];
    saved_answers: Record<string, string>;
  };
  error?: string;
}

export interface SubmitExamResponse {
  success: boolean;
  data?: {
    attempt_id: string;
    exam_title: string;
    total_marks: number;
    score: number;
    percentage: number;
    completed_at: string;
    questions_answered: number;
    questions_total: number;
    questions_correct: number;
    review?: {
      questions: ReviewQuestion[];
    };
  };
  error?: string;
}

export interface ReviewQuestion {
  question_id: string;
  question_number: number;
  prompt: string;
  marks: number;
  selected_option_id: string | null;
  correct_option_id: string;
  is_correct: boolean;
  marks_earned: number;
  explanation: string;
  options: ReviewOption[];
}

export interface ReviewOption {
  id: string;
  label: string;
  text: string;
  is_correct: boolean;
}
