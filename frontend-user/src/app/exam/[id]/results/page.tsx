'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingPage, LoadingSpinner } from '@/components/ui/Loading';
import { formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Home, 
  ChevronDown, 
  ChevronUp,
  Award,
  Clock,
  Target
} from 'lucide-react';
import type { SubmitExamResponse, ReviewQuestion } from '@/types/database';

function ResultsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const attemptId = searchParams.get('attempt');
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SubmitExamResponse['data'] | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
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
          score,
          passed,
          completed_at,
          exams (
            id,
            title,
            total_marks,
            pass_mark_percent,
            allow_review
          ),
          attempt_answers (
            question_id,
            selected_option_id,
            is_correct,
            marks_earned,
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
        .eq('student_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
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
      const passMark = Math.ceil((exam.pass_mark_percent / 100) * totalMarks);

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
          marks_earned: aa.marks_earned,
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
        score: attemptData.score || 0,
        percentage: Math.round(((attemptData.score || 0) / totalMarks) * 100),
        pass_mark: passMark,
        pass_mark_percent: exam.pass_mark_percent,
        passed: attemptData.passed || false,
        completed_at: attemptData.completed_at || new Date().toISOString(),
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
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  if (authLoading || isLoading) {
    return <LoadingPage message="Loading results..." />;
  }

  if (!user || !results) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-semibold text-gray-900">Exam Results</h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result Summary Card */}
        <Card className={`mb-8 ${results.passed ? 'border-green-500' : 'border-red-500'} border-2`}>
          <CardContent className="pt-8">
            <div className="text-center">
              {/* Result Icon */}
              <div className={`
                inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                ${results.passed ? 'bg-green-100' : 'bg-red-100'}
              `}>
                {results.passed ? (
                  <Trophy className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>

              {/* Result Text */}
              <h2 className={`text-3xl font-bold mb-2 ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                {results.passed ? 'Congratulations!' : 'Unfortunately'}
              </h2>
              <p className="text-gray-600 text-lg">
                {results.passed 
                  ? 'You have passed the IFRS 17 examination.'
                  : 'You did not pass the IFRS 17 examination this time.'
                }
              </p>

              {/* Score Display */}
              <div className="mt-8 flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{results.score}</div>
                  <div className="text-sm text-gray-500">out of {results.total_marks}</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {results.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Target className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Pass Mark</div>
                  <div className="font-semibold">{results.pass_mark} ({results.pass_mark_percent}%)</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Award className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Correct Answers</div>
                  <div className="font-semibold">{results.questions_correct} / {results.questions_total}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <CheckCircle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Answered</div>
                  <div className="font-semibold">{results.questions_answered} / {results.questions_total}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Clock className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="font-semibold text-xs">{formatDate(results.completed_at)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        {results.review && results.review.questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Question Review</h3>
            
            {results.review.questions.map((question) => {
              const isExpanded = expandedQuestions.has(question.question_id);
              
              return (
                <Card key={question.question_id}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleQuestion(question.question_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {question.is_correct ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        <CardTitle className="text-base">
                          Question {question.question_number}
                        </CardTitle>
                        <span className={`
                          text-sm px-2 py-0.5 rounded
                          ${question.is_correct 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {question.marks_earned}/{question.marks} marks
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent>
                      <p className="text-gray-900 mb-4">{question.prompt}</p>
                      
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isSelected = question.selected_option_id === option.id;
                          const isCorrect = option.is_correct;
                          
                          let bgColor = 'bg-white border-gray-200';
                          if (isCorrect) {
                            bgColor = 'bg-green-50 border-green-300';
                          } else if (isSelected && !isCorrect) {
                            bgColor = 'bg-red-50 border-red-300';
                          }
                          
                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border-2 ${bgColor}`}
                            >
                              <div className="flex items-start">
                                <span className={`
                                  flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-medium mr-3 text-sm
                                  ${isCorrect 
                                    ? 'bg-green-500 text-white' 
                                    : isSelected 
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }
                                `}>
                                  {option.label}
                                </span>
                                <span className="text-gray-900 pt-0.5">{option.text}</span>
                                {isSelected && (
                                  <span className="ml-auto text-sm text-gray-500">
                                    Your answer
                                  </span>
                                )}
                                {isCorrect && (
                                  <span className="ml-auto text-sm text-green-600 font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-1">Explanation</h4>
                          <p className="text-blue-700 text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button size="lg" onClick={() => router.push('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
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
