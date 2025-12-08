/**
 * Shared configuration constants for the IRA IFRS 17 Exam application.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'IRA IFRS 17 Exam',
  description: 'Online assessment of IFRS 17 knowledge for insurers under IRA supervision',
  organization: 'Insurance Regulatory Authority',
} as const;

/**
 * Default exam settings
 */
export const EXAM_DEFAULTS = {
  durationMinutes: 45,
  randomizeQuestions: true,
} as const;

/**
 * Timer warning thresholds (in seconds)
 */
export const TIMER_WARNINGS = {
  warning: 300,  // 5 minutes - yellow warning
  critical: 60,  // 1 minute - red critical
} as const;

/**
 * Auto-save interval for exam answers (in milliseconds)
 */
export const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

/**
 * User roles with display names
 */
export const USER_ROLES = {
  student: {
    value: 'student',
    label: 'Student',
    description: 'Can take exams and view own results',
  },
  admin: {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage exams, questions, and view all results',
  },
  super_admin: {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full access including user management',
  },
} as const;

/**
 * Attempt status with display info
 */
export const ATTEMPT_STATUS = {
  in_progress: {
    value: 'in_progress',
    label: 'In Progress',
    color: 'yellow',
  },
  submitted: {
    value: 'submitted',
    label: 'Submitted',
    color: 'green',
  },
  expired: {
    value: 'expired',
    label: 'Expired',
    color: 'red',
  },
} as const;

/**
 * API endpoints (relative to Supabase URL)
 */
export const API_ENDPOINTS = {
  startExam: '/functions/v1/start_exam',
  submitExam: '/functions/v1/submit_exam',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  examState: 'ifrs17_exam_state',
  theme: 'ifrs17_theme',
} as const;

/**
 * Route paths for navigation
 */
export const ROUTES = {
  // Student routes
  student: {
    home: '/',
    login: '/login',
    dashboard: '/dashboard',
    exam: (id: string) => `/exam/${id}`,
    results: (id: string) => `/results/${id}`,
    profile: '/profile',
  },
  // Admin routes
  admin: {
    home: '/',
    login: '/login',
    dashboard: '/dashboard',
    exams: '/exams',
    examEdit: (id: string) => `/exams/${id}`,
    questions: '/questions',
    questionEdit: (id: string) => `/questions/${id}`,
    results: '/results',
    attemptDetail: (id: string) => `/results/${id}`,
    users: '/users',
  },
} as const;
