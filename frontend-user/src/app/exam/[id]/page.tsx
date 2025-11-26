'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingPage } from '@/components/ui/Loading';
import { formatTime } from '@/lib/utils';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ExamData, ExamQuestion, ExamAttempt, StartExamResponse, SubmitExamResponse } from '@/types/database';

export default function ExamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClient();

  // Start or resume exam
  const startExam = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/start-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ exam_id: examId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', response.status, errorText);
        setError(`Failed to start exam: ${response.status} - ${errorText || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      const data: StartExamResponse = await response.json();
      
      if (!data.success || !data.data) {
        setError(data.error || 'Failed to start exam');
        return;
      }

      setExam(data.data.exam);
      setAttempt(data.data.attempt);
      setQuestions(data.data.questions);
      setAnswers(data.data.saved_answers);
      
      // Calculate time remaining
      const expiresAt = new Date(data.data.attempt.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);
      
    } catch (err) {
      console.error('Error starting exam:', err);
      setError('Failed to load exam. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [examId, supabase.auth]);

  // Save answer
  const saveAnswer = async (questionId: string, optionId: string) => {
    if (!attempt) return;
    
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            attempt_id: attempt.id,
            question_id: questionId,
            option_id: optionId,
          }),
        }
      );
    } catch (err) {
      console.error('Error saving answer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit exam
  const submitExam = async () => {
    if (!attempt) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            attempt_id: attempt.id,
            answers,
          }),
        }
      );

      const data: SubmitExamResponse = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to submit exam');
        return;
      }

      // Redirect to results page
      router.push(`/exam/${examId}/results?attempt=${attempt.id}`);
      
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
    saveAnswer(questionId, optionId);
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || showInstructions) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showInstructions]);

  // Load exam on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !showInstructions) {
      startExam();
    }
  }, [user, authLoading, router, showInstructions, startExam]);

  // Show loading state
  if (authLoading) {
    return <LoadingPage message="Loading..." />;
  }

  if (!user) {
    return null;
  }

  // Show instructions screen
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">IRA IFRS 17 Online Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• You have <strong>60 minutes</strong> to complete this exam.</li>
                <li>• The exam consists of <strong>14 multiple-choice questions</strong>.</li>
                <li>• Each question has only <strong>one correct answer</strong>.</li>
                <li>• Questions carry different marks (<strong>1 or 2 marks</strong> each).</li>
                <li>• You need <strong>60%</strong> to pass (minimum 15 out of 24 marks).</li>
                <li>• Your answers are <strong>automatically saved</strong> as you progress.</li>
                <li>• You can navigate between questions using Previous/Next buttons.</li>
                <li>• Once submitted, you <strong>cannot modify</strong> your answers.</li>
                <li>• After submission, you will see your results with explanations.</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Important</h3>
                  <p className="text-yellow-700 text-sm">
                    Do not refresh or close this page during the exam. Your progress will be saved automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => {
                  setShowInstructions(false);
                  setIsLoading(true);
                }}
              >
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading or error
  if (isLoading) {
    return <LoadingPage message="Loading exam..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || !questions.length) {
    return <LoadingPage message="Loading questions..." />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isTimeWarning = timeRemaining <= 300; // 5 minutes warning

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Timer */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-semibold text-gray-900">{exam.title}</h1>
            <div className={`flex items-center ${isTimeWarning ? 'text-red-600' : 'text-gray-700'}`}>
              <Clock className={`h-5 w-5 mr-2 ${isTimeWarning ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeRemaining)}
              </span>
              {isSaving && (
                <span className="ml-4 text-sm text-gray-500">Saving...</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Navigator */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    w-10 h-10 rounded-full text-sm font-medium transition-colors
                    ${isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : isAnswered 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>{answeredCount} of {questions.length} answered</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-100 mr-1"></span>
                Answered
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-gray-100 mr-1"></span>
                Not answered
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Question {currentQuestion.question_number} of {questions.length}
              </CardTitle>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 mb-6 text-lg">
              {currentQuestion.prompt}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <span className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3
                        ${isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}>
                        {option.label}
                      </span>
                      <span className="text-gray-900 pt-1">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={isFirstQuestion}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button 
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to submit your exam?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Questions answered:</span>
              <span className="font-medium">{answeredCount} of {questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unanswered:</span>
              <span className={`font-medium ${questions.length - answeredCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {questions.length - answeredCount}
              </span>
            </div>
          </div>

          {questions.length - answeredCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-yellow-700 text-sm">
                  You have {questions.length - answeredCount} unanswered question(s). 
                  Unanswered questions will be marked as incorrect.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitExam}
              isLoading={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
