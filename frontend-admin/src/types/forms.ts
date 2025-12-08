import { z } from 'zod';

// Exam form schema
export const examFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().nullable(),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours'),
  total_marks: z.number().min(1, 'Total marks must be at least 1'),
  pass_mark_percent: z.number().min(0, 'Pass mark cannot be negative').max(100, 'Pass mark cannot exceed 100%'),
  max_attempts: z.number().min(1, 'Max attempts must be at least 1').nullable().optional(),
  randomize_questions: z.boolean(),
  allow_review: z.boolean(),
  instructions: z.string().max(5000, 'Instructions must be less than 5000 characters').optional().nullable(),
  is_active: z.boolean(),
});

export type ExamFormData = z.infer<typeof examFormSchema>;

// Question form schema
export const optionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required').max(5, 'Label must be less than 5 characters'),
  text: z.string().min(1, 'Option text is required').max(2000, 'Option text must be less than 2000 characters'),
  is_correct: z.boolean(),
  display_order: z.number(),
});

export const questionFormSchema = z.object({
  exam_id: z.string().min(1, 'Please select an exam'),
  question_number: z.number().min(1, 'Question number must be at least 1'),
  prompt: z.string().min(10, 'Question prompt must be at least 10 characters').max(5000, 'Question prompt must be less than 5000 characters'),
  marks: z.number().min(1, 'Marks must be at least 1'),
  explanation: z.string().max(5000, 'Explanation must be less than 5000 characters').optional().nullable(),
  is_active: z.boolean(),
  options: z.array(optionSchema)
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed')
    .refine(
      (options) => options.filter(opt => opt.is_correct).length === 1,
      'Exactly one option must be marked as correct'
    ),
});

export type OptionFormData = z.infer<typeof optionSchema>;
export type QuestionFormData = z.infer<typeof questionFormSchema>;

// User form schema (for super admin)
export const userFormSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().email('Invalid email address'),
  organisation: z.string().max(200, 'Organisation must be less than 200 characters').optional().nullable(),
  role: z.enum(['student', 'admin', 'super_admin'], {
    required_error: 'Please select a role',
  }),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Bulk import schema
export const bulkImportQuestionSchema = z.object({
  question_number: z.number().min(1),
  prompt: z.string().min(10),
  marks: z.number().min(1).default(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  option_e: z.string().optional(),
  option_f: z.string().optional(),
  correct_answer: z.string().regex(/^[A-Fa-f]$/, 'Correct answer must be a letter (A-F)'),
  explanation: z.string().optional(),
});

export type BulkImportQuestionData = z.infer<typeof bulkImportQuestionSchema>;

// Filter schemas
export const examFilterSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

export type ExamFilterData = z.infer<typeof examFilterSchema>;

export const attemptFilterSchema = z.object({
  exam_id: z.string().optional(),
  status: z.enum(['in_progress', 'submitted', 'expired']).optional(),
  passed: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

export type AttemptFilterData = z.infer<typeof attemptFilterSchema>;

export const userFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['student', 'admin', 'super_admin']).optional(),
  organisation: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

export type UserFilterData = z.infer<typeof userFilterSchema>;
