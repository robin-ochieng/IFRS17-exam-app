'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingPage } from '@/components/ui/Loading';
import { formatTime } from '@/lib/utils';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, BookOpen, Timer, Shuffle, Save, Eye } from 'lucide-react';
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
      // Use expires_at if available, otherwise calculate from started_at + duration
      let remaining = 0;
      const now = Date.now();
      
      console.log('Attempt data:', {
        started_at: data.data.attempt.started_at,
        expires_at: data.data.attempt.expires_at,
        duration_minutes: data.data.exam.duration_minutes,
        now: new Date(now).toISOString()
      });
      
      if (data.data.attempt.expires_at) {
        const expiresAt = new Date(data.data.attempt.expires_at).getTime();
        remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        console.log('Using expires_at:', { expiresAt: new Date(expiresAt).toISOString(), remaining });
      } else if (data.data.attempt.started_at && data.data.exam.duration_minutes) {
        // Fallback: calculate from started_at + exam duration
        const startedAt = new Date(data.data.attempt.started_at).getTime();
        const durationMs = data.data.exam.duration_minutes * 60 * 1000;
        const expiresAt = startedAt + durationMs;
        remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        console.log('Using fallback calculation:', { startedAt: new Date(startedAt).toISOString(), expiresAt: new Date(expiresAt).toISOString(), remaining });
      } else {
        // Last resort: use full duration from now (for testing)
        remaining = data.data.exam.duration_minutes * 60;
        console.log('Using full duration as fallback:', remaining);
      }
      
      // If time has expired, auto-submit
      if (remaining <= 0) {
        console.log('Time already expired, should auto-submit');
      }
      
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
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg p-1.5 shadow-sm">
                  <Image
                    src="/IRA logo.png"
                    alt="IRA Logo"
                    width={100}
                    height={36}
                    className="h-8 w-auto"
                    priority
                  />
                </div>
                <div className="hidden sm:block h-8 w-px bg-blue-500/50"></div>
                <h1 className="hidden sm:block text-lg font-semibold text-white">IFRS 17 Online Exam</h1>
              </div>
              <div className="text-sm text-blue-200">
                Assessment Portal
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Exam</h2>
            <p className="text-gray-600">Please review the instructions below before starting</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Timer className="h-7 w-7 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">70</div>
              <div className="text-sm text-gray-500 font-medium">Minutes</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">35</div>
              <div className="text-sm text-gray-500 font-medium">Questions</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">100</div>
              <div className="text-sm text-gray-500 font-medium">Total Marks</div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center text-lg">
                <BookOpen className="h-5 w-5 mr-3 text-blue-600" />
                Exam Instructions
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <Timer className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-gray-800">You have <strong className="text-blue-700">1 hour and 10 minutes (70 minutes)</strong> to complete this exam.</span>
                  </div>
                </li>
                <li className="flex items-start p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-4">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-gray-800">Each question has only <strong className="text-emerald-700">one correct answer</strong>.</span>
                  </div>
                </li>
                <li className="flex items-start p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                    <Shuffle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-gray-800">Questions are <strong className="text-purple-700">randomized</strong> for each candidate.</span>
                  </div>
                </li>
                <li className="flex items-start p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                    <Eye className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-gray-800">After submission, you will see <strong className="text-indigo-700">all questions with correct answers and explanations</strong>.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Warning Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <div className="flex items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 text-lg">Important Notice</h3>
                <p className="text-amber-700 mt-1">
                  Do not refresh or close this page during the exam. Your progress will be saved automatically, but interruptions may affect your exam experience.
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => {
                setShowInstructions(false);
                setIsLoading(true);
              }}
              className="group flex items-center gap-3 px-10 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 active:scale-95"
            >
              <span>Start Exam</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </main>
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
      {/* Header with Logo and Timer */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <Image
                  src="/IRA logo.png"
                  alt="IRA Logo"
                  width={100}
                  height={36}
                  className="h-8 w-auto"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white">IFRS 17 Online Exam</h1>
              </div>
            </div>
            
            {/* Right: Time Remaining */}
            <div className={`flex items-center ${isTimeWarning ? 'bg-red-500/20 px-4 py-2 rounded-lg' : ''}`}>
              <div className="flex flex-col items-end mr-3">
                <span className={`text-xs font-medium ${isTimeWarning ? 'text-red-300' : 'text-slate-400'}`}>
                  Time Remaining
                </span>
                <span className={`font-mono text-xl font-bold ${isTimeWarning ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Clock className={`h-6 w-6 ${isTimeWarning ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
              {isSaving && (
                <span className="ml-4 text-sm text-slate-400">Saving...</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Navigator */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Question Navigator</h3>
                  <p className="text-sm text-gray-500">{answeredCount} of {questions.length} answered</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-200"></span>
                  <span className="text-gray-600">Answered</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-300 ring-2 ring-gray-100"></span>
                  <span className="text-gray-600">Not answered</span>
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = index === currentQuestionIndex;
                const displayNumber = index + 1; // Sequential number for user display
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105
                      ${isCurrent 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300' 
                        : isAnswered 
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                      }
                    `}
                  >
                    {displayNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-lg">{currentQuestionIndex + 1}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <p className="text-sm text-gray-500">Select the correct answer below</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="font-semibold">{currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}</span>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.01]
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`
                        shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 transition-all duration-200
                        ${isSelected 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {option.label}
                      </span>
                      <span className={`text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {option.text}
                      </span>
                      {isSelected && (
                        <CheckCircle className="ml-auto h-5 w-5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={isFirstQuestion}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                  ${isFirstQuestion 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md active:scale-95'
                  }
                `}
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>

              {isLastQuestion ? (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 active:scale-95"
                >
                  <CheckCircle className="h-5 w-5" />
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 active:scale-95"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
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
