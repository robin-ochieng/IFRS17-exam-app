export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'admin' | 'super_admin';
export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

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
          user_id: string;
          started_at: string;
          submitted_at: string | null;
          expires_at: string;
          raw_score: number | null;
          percent_score: number | null;
          passed: boolean | null;
          status: AttemptStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          user_id: string;
          started_at?: string;
          submitted_at?: string | null;
          expires_at?: string;
          raw_score?: number | null;
          percent_score?: number | null;
          passed?: boolean | null;
          status?: AttemptStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          user_id?: string;
          started_at?: string;
          submitted_at?: string | null;
          expires_at?: string;
          raw_score?: number | null;
          percent_score?: number | null;
          passed?: boolean | null;
          status?: AttemptStatus;
          created_at?: string;
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
      exam_statistics: {
        Row: {
          exam_id: string;
          exam_title: string;
          total_attempts: number;
          submitted_attempts: number;
          average_score: number;
          pass_rate: number;
          highest_score: number;
          lowest_score: number;
        };
      };
      leaderboard: {
        Row: {
          user_id: string;
          full_name: string;
          organisation: string | null;
          exam_id: string;
          exam_title: string;
          best_raw_score: number;
          best_percent_score: number;
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
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Exam = Database['public']['Tables']['exams']['Row'];
export type ExamInsert = Database['public']['Tables']['exams']['Insert'];
export type ExamUpdate = Database['public']['Tables']['exams']['Update'];

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
export type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

export type Option = Database['public']['Tables']['options']['Row'];
export type OptionInsert = Database['public']['Tables']['options']['Insert'];
export type OptionUpdate = Database['public']['Tables']['options']['Update'];

export type Attempt = Database['public']['Tables']['attempts']['Row'];
export type AttemptInsert = Database['public']['Tables']['attempts']['Insert'];
export type AttemptUpdate = Database['public']['Tables']['attempts']['Update'];

export type AttemptAnswer = Database['public']['Tables']['attempt_answers']['Row'];
export type AttemptAnswerInsert = Database['public']['Tables']['attempt_answers']['Insert'];
export type AttemptAnswerUpdate = Database['public']['Tables']['attempt_answers']['Update'];

export type ExamStatistics = Database['public']['Views']['exam_statistics']['Row'];
export type Leaderboard = Database['public']['Views']['leaderboard']['Row'];

// Extended types with relations
export interface ExamWithQuestionCount extends Exam {
  questions: { count: number }[];
}

export interface ExamWithQuestions extends Exam {
  questions: QuestionWithOptions[];
}

export interface QuestionWithOptions extends Question {
  options: Option[];
}

export interface AttemptWithDetails extends Attempt {
  exam: Exam;
  user: Pick<Profile, 'full_name' | 'email' | 'organisation'>;
  answers?: AttemptAnswerWithQuestion[];
}

export interface AttemptAnswerWithQuestion extends AttemptAnswer {
  question: QuestionWithOptions;
}

export interface UserWithAttempts extends Profile {
  attempts: { count: number }[];
}
