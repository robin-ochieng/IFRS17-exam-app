'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LoadingPage, LoadingSpinner } from '@/components/ui/Loading';
import { formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  ChevronDown, 
  ChevronUp,
  Award,
  Clock,
  User,
  FileText,
  Target,
  AlertCircle
} from 'lucide-react';
import type { SubmitExamResponse, ReviewQuestion } from '@/types/database';

function ResultsContent() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const attemptId = searchParams.get('attempt');
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SubmitExamResponse['data'] | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string> | 'all'>('all');
  
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Try to get the latest completed attempt for this exam
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: attempt, error } = await supabase
        .from('attempts')
        .select(`
          id,
          raw_score,
          submitted_at,
          exams (
            id,
            title,
            total_marks,
            allow_review
          ),
          attempt_answers (
            question_id,
            selected_option_id,
            is_correct,
            awarded_marks,
            questions (
              id,
              question_number,
              prompt,
              marks,
              explanation,
              options (
                id,
                label,
                text,
                is_correct
              )
            )
          )
        `)
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !attempt) {
        console.error('Error fetching results:', error);
        router.push('/dashboard');
        return;
      }

      // Transform data to match SubmitExamResponse format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attemptData = attempt as any;
      const exam = attemptData.exams;
      const totalMarks = exam.total_marks;
      const score = attemptData.raw_score || 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviewQuestions: ReviewQuestion[] = attemptData.attempt_answers.map((aa: any) => {
        const q = aa.questions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const correctOption = q.options.find((o: any) => o.is_correct);
        
        return {
          question_id: q.id,
          question_number: q.question_number,
          prompt: q.prompt,
          marks: q.marks,
          selected_option_id: aa.selected_option_id,
          correct_option_id: correctOption?.id,
          is_correct: aa.is_correct,
          marks_earned: aa.awarded_marks || 0,
          explanation: q.explanation,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: q.options.map((o: any) => ({
            id: o.id,
            label: o.label,
            text: o.text,
            is_correct: o.is_correct,
          })),
        };
      }).sort((a: ReviewQuestion, b: ReviewQuestion) => a.question_number - b.question_number);

      setResults({
        attempt_id: attemptData.id,
        exam_title: exam.title,
        total_marks: totalMarks,
        score: score,
        percentage: Math.round((score / totalMarks) * 100),
        completed_at: attemptData.submitted_at || new Date().toISOString(),
        questions_answered: attemptData.attempt_answers.length,
        questions_total: reviewQuestions.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions_correct: attemptData.attempt_answers.filter((a: any) => a.is_correct).length,
        review: exam.allow_review ? { questions: reviewQuestions } : undefined,
      });
      
      setIsLoading(false);
    };

    if (user) {
      fetchResults();
    }
  }, [user, authLoading, router, examId, attemptId, supabase]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      // If currently 'all', create a set with all except clicked one
      if (prev === 'all') {
        const allIds = new Set(results?.review?.questions.map(q => q.question_id) || []);
        allIds.delete(questionId);
        return allIds;
      }
      // Otherwise toggle normally
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const isQuestionExpanded = (questionId: string) => {
    if (expandedQuestions === 'all') return true;
    return expandedQuestions.has(questionId);
  };

  if (authLoading || isLoading) {
    return <LoadingPage message="Loading results..." />;
  }

  if (!user || !results) {
    return null;
  }

  const questionsWrong = results.questions_total - results.questions_correct;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
              <h1 className="hidden sm:block text-lg font-semibold text-white">Exam Results</h1>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Candidate'}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Completed: {formatDate(results.completed_at)}</span>
            </div>
          </div>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-8 py-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Examination Complete</h2>
            <p className="text-blue-200 text-lg">IFRS 17 Online Exam</p>
          </div>

          {/* Score Section */}
          <div className="px-8 py-10">
            {/* Main Score Display - Using Accuracy (correct/total questions) */}
            <div className="flex flex-col items-center mb-10">
              {(() => {
                const accuracyPercent = Math.round((results.questions_correct / results.questions_total) * 100);
                return (
                  <>
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#E5E7EB"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#3B82F6"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(accuracyPercent / 100) * 440} 440`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">{accuracyPercent}%</span>
                        <span className="text-sm text-gray-500">Score</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-2xl font-semibold text-gray-900">
                        {results.questions_correct} <span className="text-gray-400 font-normal">/ {results.questions_total}</span>
                      </p>
                      <p className="text-gray-500">Questions Correct</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-sm border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{results.questions_total}</div>
                <div className="text-sm text-gray-600 font-medium">Total Questions</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 text-center shadow-sm border border-green-100">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600">{results.questions_correct}</div>
                <div className="text-sm text-gray-600 font-medium">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 text-center shadow-sm border border-red-100">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-600">{questionsWrong}</div>
                <div className="text-sm text-gray-600 font-medium">Incorrect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review Section */}
        {results.review && results.review.questions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-6 w-6 text-blue-600" />
                Question Review
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Correct
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Incorrect
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {results.review.questions.map((question, index) => {
                const isExpanded = isQuestionExpanded(question.question_id);
                const isCorrect = question.is_correct;
                
                return (
                  <div 
                    key={question.question_id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                      isCorrect ? 'border-green-200' : 'border-red-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div 
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        isCorrect ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
                      }`}
                      onClick={() => toggleQuestion(question.question_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <XCircle className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                            <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {question.marks_earned || 0}/{question.marks} marks
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isCorrect 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Question Content */}
                    {isExpanded && (
                      <div className="px-6 py-5 border-t border-gray-100">
                        {/* Question Prompt */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-5">
                          <p className="text-gray-800 leading-relaxed">{question.prompt}</p>
                        </div>
                        
                        {/* Options */}
                        <div className="space-y-3 mb-5">
                          {question.options.map((option) => {
                            const isSelected = question.selected_option_id === option.id;
                            const isCorrectOption = option.is_correct;
                            
                            let containerClass = 'bg-white border-gray-200';
                            let labelClass = 'bg-gray-100 text-gray-600';
                            
                            if (isCorrectOption) {
                              containerClass = 'bg-green-50 border-green-300';
                              labelClass = 'bg-green-500 text-white';
                            } else if (isSelected && !isCorrectOption) {
                              containerClass = 'bg-red-50 border-red-300';
                              labelClass = 'bg-red-500 text-white';
                            }
                            
                            return (
                              <div
                                key={option.id}
                                className={`p-4 rounded-xl border-2 ${containerClass}`}
                              >
                                <div className="flex items-start">
                                  <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold mr-4 ${labelClass}`}>
                                    {option.label}
                                  </span>
                                  <span className="text-gray-800 pt-1 flex-1">{option.text}</span>
                                  <div className="flex items-center gap-2 ml-3">
                                    {isSelected && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        isCorrectOption ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        Your answer
                                      </span>
                                    )}
                                    {isCorrectOption && (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-blue-800 mb-1">Explanation</h5>
                                <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 py-8">
          <Button 
            size="lg" 
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl"
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Dashboard
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Insurance Regulatory Authority. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
