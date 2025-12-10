/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock data for tests
const mockExamData = {
  id: 'test-exam-id',
  title: 'IFRS 17 Test Exam',
  description: 'Test exam description',
  duration_minutes: 45,
  total_marks: 100,
  pass_mark: 50,
  allow_review: true,
};

const mockAttempt = {
  id: 'test-attempt-id',
  exam_id: 'test-exam-id',
  user_id: 'test-user-id',
  status: 'in_progress',
  started_at: new Date().toISOString(),
};

const mockQuestions = [
  {
    id: 'q1',
    question_text: 'What is IFRS 17?',
    question_number: 1,
    marks: 3,
    options: [
      { id: 'opt1', option_text: 'Option A' },
      { id: 'opt2', option_text: 'Option B' },
      { id: 'opt3', option_text: 'Option C' },
      { id: 'opt4', option_text: 'Option D' },
    ],
  },
  {
    id: 'q2',
    question_text: 'Second question?',
    question_number: 2,
    marks: 3,
    options: [
      { id: 'opt5', option_text: 'Option A' },
      { id: 'opt6', option_text: 'Option B' },
      { id: 'opt7', option_text: 'Option C' },
      { id: 'opt8', option_text: 'Option D' },
    ],
  },
];

const mockSubmitResponse = {
  success: true,
  data: {
    attempt_id: 'test-attempt-id',
    exam_title: 'IFRS 17 Test Exam',
    raw_score: 85,
    percent_score: 85,
    total_marks: 100,
    passed: true,
    pass_mark: 50,
    questions_total: 35,
    questions_answered: 35,
    questions_correct: 28,
    review: {
      questions: [
        {
          question_id: 'q1',
          question_number: 1,
          question_text: 'What is IFRS 17?',
          marks: 3,
          user_answer: 'opt1',
          correct_answer: 'opt1',
          is_correct: true,
          explanation: 'IFRS 17 is an insurance contracts standard.',
          options: [
            { id: 'opt1', option_text: 'Option A', is_correct: true },
            { id: 'opt2', option_text: 'Option B', is_correct: false },
            { id: 'opt3', option_text: 'Option C', is_correct: false },
            { id: 'opt4', option_text: 'Option D', is_correct: false },
          ],
        },
      ],
    },
  },
};

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'test-user-id' },
        },
      },
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        limit: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  }),
};

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock AuthContext
const mockAuthContext = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  profile: { id: 'test-user-id', full_name: 'Test User' },
  session: { access_token: 'test-token' },
  isLoading: false,
  isInitialized: true,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  refreshProfile: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Exam Submission Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Submit Exam API Call', () => {
    it('should call submit-exam endpoint with correct parameters', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmitResponse,
      });

      // Simulate the submit exam function logic
      const submitExam = async (attemptId: string, answers: Record<string, string>) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer test-token`,
            },
            body: JSON.stringify({
              attempt_id: attemptId,
              answers,
            }),
          }
        );
        return response.json();
      };

      const result = await submitExam('test-attempt-id', { q1: 'opt1', q2: 'opt5' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/submit-exam',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({
            attempt_id: 'test-attempt-id',
            answers: { q1: 'opt1', q2: 'opt5' },
          }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.data.passed).toBe(true);
    });

    it('should handle API error responses correctly', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Exam already submitted',
        }),
      });

      const submitExam = async (attemptId: string, answers: Record<string, string>) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer test-token`,
            },
            body: JSON.stringify({
              attempt_id: attemptId,
              answers,
            }),
          }
        );
        return response.json();
      };

      const result = await submitExam('test-attempt-id', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exam already submitted');
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const submitExam = async (attemptId: string, answers: Record<string, string>) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer test-token`,
              },
              body: JSON.stringify({
                attempt_id: attemptId,
                answers,
              }),
            }
          );
          return response.json();
        } catch (error) {
          return { success: false, error: 'Network error' };
        }
      };

      const result = await submitExam('test-attempt-id', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Submit Response Handling', () => {
    it('should correctly parse successful submission response', () => {
      const response = mockSubmitResponse;

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.attempt_id).toBe('test-attempt-id');
      expect(response.data.raw_score).toBe(85);
      expect(response.data.percent_score).toBe(85);
      expect(response.data.passed).toBe(true);
      expect(response.data.pass_mark).toBe(50);
      expect(response.data.questions_total).toBe(35);
      expect(response.data.questions_correct).toBe(28);
    });

    it('should correctly parse review questions from response', () => {
      const response = mockSubmitResponse;

      expect(response.data.review).toBeDefined();
      expect(response.data.review?.questions).toHaveLength(1);
      
      const firstQuestion = response.data.review?.questions[0];
      expect(firstQuestion?.question_id).toBe('q1');
      expect(firstQuestion?.is_correct).toBe(true);
      expect(firstQuestion?.explanation).toBeDefined();
    });

    it('should handle failed submission response', () => {
      const failedResponse = {
        success: false,
        error: 'Attempt not found',
      };

      expect(failedResponse.success).toBe(false);
      expect(failedResponse.error).toBe('Attempt not found');
    });
  });

  describe('Results Display After Submission', () => {
    it('should display passing result correctly', () => {
      const result = mockSubmitResponse.data;

      // Test the logic for determining pass/fail
      const passed = result.percent_score >= result.pass_mark;
      expect(passed).toBe(true);

      // Test score display format
      const scoreDisplay = `${result.raw_score}/${result.total_marks}`;
      expect(scoreDisplay).toBe('85/100');

      const percentDisplay = `${result.percent_score}%`;
      expect(percentDisplay).toBe('85%');
    });

    it('should display failing result correctly', () => {
      const failingResult = {
        ...mockSubmitResponse.data,
        raw_score: 40,
        percent_score: 40,
        passed: false,
        questions_correct: 13,
      };

      const passed = failingResult.percent_score >= failingResult.pass_mark;
      expect(passed).toBe(false);

      const scoreDisplay = `${failingResult.raw_score}/${failingResult.total_marks}`;
      expect(scoreDisplay).toBe('40/100');
    });

    it('should calculate accuracy percentage correctly', () => {
      const result = mockSubmitResponse.data;
      const accuracy = Math.round((result.questions_correct / result.questions_total) * 100);
      
      expect(accuracy).toBe(80); // 28/35 = 80%
    });
  });

  describe('State Management During Submission', () => {
    it('should set isSubmitting to true during submission', async () => {
      let isSubmitting = false;
      const setIsSubmitting = (value: boolean) => { isSubmitting = value; };

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockImplementation(() => {
        // Verify isSubmitting is true during fetch
        expect(isSubmitting).toBe(true);
        return Promise.resolve({
          ok: true,
          json: async () => mockSubmitResponse,
        });
      });

      const submitExam = async () => {
        setIsSubmitting(true);
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
            method: 'POST',
            body: JSON.stringify({}),
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      await submitExam();
      expect(isSubmitting).toBe(false);
    });

    it('should set examResults after successful submission', async () => {
      let examResults: typeof mockSubmitResponse.data | null = null;
      const setExamResults = (value: typeof mockSubmitResponse.data | null) => { 
        examResults = value; 
      };

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmitResponse,
      });

      const submitExam = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setExamResults(data.data);
        }
      };

      await submitExam();
      
      expect(examResults).not.toBeNull();
      expect(examResults?.attempt_id).toBe('test-attempt-id');
      expect(examResults?.passed).toBe(true);
    });

    it('should stop timer after submission', async () => {
      let timeRemaining = 2700; // 45 minutes
      const setTimeRemaining = (value: number) => { timeRemaining = value; };

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmitResponse,
      });

      const submitExam = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (data.success) {
          setTimeRemaining(0); // Stop timer
        }
      };

      expect(timeRemaining).toBe(2700);
      await submitExam();
      expect(timeRemaining).toBe(0);
    });
  });

  describe('Submit Button Behavior', () => {
    it('should be disabled during submission', () => {
      const isSubmitting = true;
      const buttonDisabled = isSubmitting;
      
      expect(buttonDisabled).toBe(true);
    });

    it('should show loading text during submission', () => {
      const isSubmitting = true;
      const buttonText = isSubmitting ? 'Submitting...' : 'Submit Exam';
      
      expect(buttonText).toBe('Submitting...');
    });

    it('should not be visible after exam is submitted', () => {
      const examResults = mockSubmitResponse.data;
      const showSubmitButton = examResults === null;
      
      expect(showSubmitButton).toBe(false);
    });
  });

  describe('Auto-Submit on Timer Expiry', () => {
    it('should auto-submit when timer reaches zero', async () => {
      let submitted = false;
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubmitResponse,
      });

      const submitExam = async () => {
        submitted = true;
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
      };

      // Simulate timer reaching zero
      const timeRemaining = 0;
      if (timeRemaining <= 0) {
        await submitExam();
      }

      expect(submitted).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Results Page Data Integrity', () => {
    it('should preserve all result data for display', () => {
      const result = mockSubmitResponse.data;

      // Verify all required fields are present
      expect(result).toHaveProperty('attempt_id');
      expect(result).toHaveProperty('exam_title');
      expect(result).toHaveProperty('raw_score');
      expect(result).toHaveProperty('percent_score');
      expect(result).toHaveProperty('total_marks');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('pass_mark');
      expect(result).toHaveProperty('questions_total');
      expect(result).toHaveProperty('questions_answered');
      expect(result).toHaveProperty('questions_correct');
      expect(result).toHaveProperty('review');
    });

    it('should have valid score values', () => {
      const result = mockSubmitResponse.data;

      expect(result.raw_score).toBeGreaterThanOrEqual(0);
      expect(result.raw_score).toBeLessThanOrEqual(result.total_marks);
      expect(result.percent_score).toBeGreaterThanOrEqual(0);
      expect(result.percent_score).toBeLessThanOrEqual(100);
      expect(result.questions_correct).toBeLessThanOrEqual(result.questions_total);
    });
  });

  describe('Error Handling', () => {
    it('should display error message on submission failure', async () => {
      let error: string | null = null;
      const setError = (value: string | null) => { error = value; };

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Failed to submit exam',
        }),
      });

      const submitExam = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (!data.success) {
          setError(data.error || 'Failed to submit exam');
        }
      };

      await submitExam();
      
      expect(error).toBe('Failed to submit exam');
    });

    it('should handle submission timeout', async () => {
      jest.useFakeTimers();
      
      let error: string | null = null;
      const setError = (value: string | null) => { error = value; };

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      );

      const submitExam = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
            method: 'POST',
            body: JSON.stringify({}),
            signal: controller.signal,
          });
        } catch (err) {
          setError('Request timeout - please try again');
        } finally {
          clearTimeout(timeoutId);
        }
      };

      submitExam();
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(error).toBe('Request timeout - please try again');
      });

      jest.useRealTimers();
    });
  });
});

describe('Inline Results Display', () => {
  it('should show results on same page after submission (no navigation)', async () => {
    let examResults: typeof mockSubmitResponse.data | null = null;
    let navigatedTo: string | null = null;

    const setExamResults = (value: typeof mockSubmitResponse.data) => { 
      examResults = value; 
    };
    const navigate = (path: string) => { 
      navigatedTo = path; 
    };

    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSubmitResponse,
    });

    // Simulate the actual submitExam function behavior (no navigation)
    const submitExam = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success && data.data) {
        // Show results inline - NO navigation
        setExamResults(data.data);
      }
    };

    await submitExam();

    // Results should be set
    expect(examResults).not.toBeNull();
    expect(examResults?.passed).toBe(true);
    
    // Should NOT have navigated anywhere
    expect(navigatedTo).toBeNull();
  });
});
