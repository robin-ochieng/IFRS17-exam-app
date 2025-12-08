// Application constants

export const APP_NAME = 'IRA IFRS 17 Exam Admin';
export const APP_DESCRIPTION = 'Admin Dashboard for IRA IFRS 17 Examination System';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = {
  csv: ['text/csv', 'application/vnd.ms-excel'],
  json: ['application/json'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

// Role definitions
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Attempt status definitions
export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  EXPIRED: 'expired',
} as const;

// Exam defaults
export const EXAM_DEFAULTS = {
  DURATION_MINUTES: 45,
  TOTAL_MARKS: 100,
  PASS_MARK_PERCENT: 60,
  RANDOMIZE_QUESTIONS: false,
  ALLOW_REVIEW: true,
  IS_ACTIVE: false,
} as const;

// Question defaults
export const QUESTION_DEFAULTS = {
  MARKS: 1,
  IS_ACTIVE: true,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
} as const;

// Navigation items for sidebar
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Exams',
    href: '/exams',
    icon: 'BookOpen',
    children: [
      { title: 'All Exams', href: '/exams' },
      { title: 'Create New', href: '/exams/new' },
    ],
  },
  {
    title: 'Questions',
    href: '/questions',
    icon: 'HelpCircle',
    children: [
      { title: 'Question Bank', href: '/questions' },
      { title: 'Import', href: '/questions/import' },
    ],
  },
  {
    title: 'Results',
    href: '/results',
    icon: 'BarChart3',
    children: [
      { title: 'Overview', href: '/results' },
      { title: 'All Attempts', href: '/results/attempts' },
      { title: 'Analytics', href: '/results/analytics' },
    ],
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'Users',
  },
] as const;
