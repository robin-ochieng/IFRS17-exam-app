'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Clock, Download, User, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface AttemptDetails {
  id: string;
  exam_id: string;
  user_id: string;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
  is_completed: boolean;
  total_answered: number;
  profile: {
    full_name: string | null;
    email: string | null;
    company: string | null;
    phone: string | null;
  };
  exam: {
    id: string;
    title: string;
    total_marks: number;
    pass_mark_percent: number;
    duration_minutes: number;
    allows_review: boolean;
  };
}

interface AnswerDetail {
  id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean | null;
  answered_at: string | null;
  question: {
    question_number: number;
    prompt: string;
    marks: number;
    explanation: string | null;
  };
  selected_option: {
    label: string;
    text: string;
  } | null;
  correct_option: {
    label: string;
    text: string;
  } | null;
}

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id as string;

  const [attempt, setAttempt] = useState<AttemptDetails | null>(null);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch attempt details
      const { data: attemptData, error: attemptError } = await (supabase as any)
        .from('attempts')
        .select(`
          id,
          exam_id,
          user_id,
          score,
          passed,
          started_at,
          submitted_at,
          is_completed,
          total_answered,
          profile:profiles!attempts_user_id_fkey (
            full_name,
            email,
            company,
            phone
          ),
          exam:exams!attempts_exam_id_fkey (
            id,
            title,
            total_marks,
            pass_mark_percent,
            duration_minutes,
            allows_review
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError || !attemptData) {
        router.push('/results');
        return;
      }

      setAttempt(attemptData as unknown as AttemptDetails);

      // Fetch answers with question and option details
      const { data: answersData } = await (supabase as any)
        .from('attempt_answers')
        .select(`
          id,
          question_id,
          selected_option_id,
          is_correct,
          answered_at,
          question:questions (
            question_number,
            prompt,
            marks,
            explanation
          )
        `)
        .eq('attempt_id', attemptId)
        .order('answered_at', { ascending: true });

      interface AnswerRow {
        id: string;
        question_id: string;
        selected_option_id: string | null;
        is_correct: boolean | null;
        answered_at: string | null;
        question: {
          question_number: number;
          prompt: string;
          marks: number;
          explanation: string | null;
        };
      }

      // Fetch selected options and correct options for each answer
      if (answersData) {
        const enrichedAnswers = await Promise.all(
          (answersData as AnswerRow[]).map(async (answer) => {
            let selectedOption = null;
            let correctOption = null;

            if (answer.selected_option_id) {
              const { data: optData } = await (supabase as any)
                .from('options')
                .select('label, text')
                .eq('id', answer.selected_option_id)
                .single();
              selectedOption = optData;
            }

            // Get correct option for this question
            const { data: correctOptData } = await (supabase as any)
              .from('options')
              .select('label, text')
              .eq('question_id', answer.question_id)
              .eq('is_correct', true)
              .single();
            correctOption = correctOptData;

            return {
              ...answer,
              question: answer.question,
              selected_option: selectedOption,
              correct_option: correctOption,
            };
          })
        );

        // Sort by question number
        enrichedAnswers.sort((a, b) => {
          const qA = (a.question as { question_number: number })?.question_number || 0;
          const qB = (b.question as { question_number: number })?.question_number || 0;
          return qA - qB;
        });

        setAnswers(enrichedAnswers as unknown as AnswerDetail[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [attemptId, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!attempt) {
    return null;
  }

  const score = attempt.score || 0;
  const totalMarks = attempt.exam?.total_marks || 100;
  const percentage = Math.round((score / totalMarks) * 100);
  const correctAnswers = answers.filter((a) => a.is_correct).length;
  const incorrectAnswers = answers.filter((a) => a.is_correct === false).length;
  const unanswered = answers.filter((a) => !a.selected_option_id).length;

  // Calculate duration
  let duration = '--';
  if (attempt.started_at && attempt.submitted_at) {
    const startTime = new Date(attempt.started_at).getTime();
    const endTime = new Date(attempt.submitted_at).getTime();
    const durationMs = endTime - startTime;
    const durationMins = Math.floor(durationMs / 60000);
    const durationSecs = Math.floor((durationMs % 60000) / 1000);
    duration = `${durationMins}m ${durationSecs}s`;
  }

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF report
    // For now, we'll just alert
    alert('PDF export coming soon');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Results', href: '/results' },
          { label: attempt.profile?.full_name || 'Candidate' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title={`Result: ${attempt.profile?.full_name || 'Unknown Candidate'}`}
            description={attempt.exam?.title || 'Exam'}
          />
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{attempt.profile?.full_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{attempt.profile?.email || 'No email'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{attempt.profile?.company || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{attempt.profile?.phone || 'Not provided'}</p>
            </div>
          </CardBody>
        </Card>

        {/* Exam Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Exam</p>
              <p className="font-medium">{attempt.exam?.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="font-medium">
                {format(new Date(attempt.started_at), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="font-medium">
                {attempt.submitted_at
                  ? format(new Date(attempt.submitted_at), 'MMM d, yyyy HH:mm')
                  : 'Not submitted'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Score Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Score Summary</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {score}/{totalMarks}
              </p>
              <p className="text-lg text-gray-500">{percentage}%</p>
              <div className="mt-2">
                {attempt.is_completed ? (
                  attempt.passed ? (
                    <Badge variant="success" className="text-lg px-4 py-1">
                      PASSED
                    </Badge>
                  ) : (
                    <Badge variant="danger" className="text-lg px-4 py-1">
                      FAILED
                    </Badge>
                  )
                ) : (
                  <Badge variant="warning" className="text-lg px-4 py-1">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 bg-green-50 rounded">
                <p className="font-semibold text-green-700">{correctAnswers}</p>
                <p className="text-green-600">Correct</p>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <p className="font-semibold text-red-700">{incorrectAnswers}</p>
                <p className="text-red-600">Incorrect</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-700">{unanswered}</p>
                <p className="text-gray-600">Unanswered</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center">
              Pass mark: {attempt.exam?.pass_mark_percent}%
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Question-by-Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {answers.map((answer, index) => {
              const question = answer.question;
              if (!question) return null;

              return (
                <div
                  key={answer.id}
                  className={`p-4 rounded-lg border ${
                    answer.is_correct === true
                      ? 'border-green-200 bg-green-50'
                      : answer.is_correct === false
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        {answer.is_correct === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : answer.is_correct === false ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            Question {question.question_number}
                          </span>
                          <Badge variant="info">{question.marks} marks</Badge>
                        </div>
                        <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                          {question.prompt}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Selected:</span>
                            <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                              {answer.selected_option ? (
                                <>
                                  <strong>{answer.selected_option.label}.</strong>{' '}
                                  {answer.selected_option.text}
                                </>
                              ) : (
                                <span className="text-gray-400 italic">No answer selected</span>
                              )}
                            </span>
                          </div>
                          {!answer.is_correct && answer.correct_option && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[100px]">Correct:</span>
                              <span className="text-green-700">
                                <strong>{answer.correct_option.label}.</strong>{' '}
                                {answer.correct_option.text}
                              </span>
                            </div>
                          )}
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
