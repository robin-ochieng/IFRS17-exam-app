// API response types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalQuestions: number;
  totalCandidates: number;
  attemptsThisWeek: number;
  averagePassRate: number;
}

export interface RecentAttempt {
  id: string;
  user_name: string;
  user_email: string;
  exam_title: string;
  submitted_at: string;
  percent_score: number;
  passed: boolean;
}

// Charts data types
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface PassFailDistribution {
  passed: number;
  failed: number;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeAnswerDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  examId?: string;
}

// Bulk import types
export interface ImportValidationResult {
  row: number;
  valid: boolean;
  data?: Record<string, unknown>;
  errors?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
