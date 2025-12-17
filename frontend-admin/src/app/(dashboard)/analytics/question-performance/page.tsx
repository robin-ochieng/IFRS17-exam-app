'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Select,
  LoadingSpinner,
  Badge,
  Button,
  Modal,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
} from 'lucide-react';
import type { Exam } from '@/types/database';

// Types for question performance data
interface QuestionPerformance {
  questionId: string;
  questionNumber: number;
  prompt: string;
  marks: number;
  examId: string;
  examTitle: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  successRate: number;
}

interface OptionAnalysis {
  optionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
  selectionCount: number;
  selectionPercentage: number;
}

interface QuestionDetail extends QuestionPerformance {
  explanation: string;
  options: OptionAnalysis[];
}

// Color helper for success rate
const getSuccessRateColor = (rate: number): string => {
  if (rate >= 80) return '#22c55e'; // green
  if (rate >= 60) return '#f59e0b'; // amber
  if (rate >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
};

const getSuccessRateBadgeVariant = (rate: number): 'success' | 'warning' | 'danger' => {
  if (rate >= 70) return 'success';
  if (rate >= 50) return 'warning';
  return 'danger';
};

type SortField = 'questionNumber' | 'totalAttempts' | 'successRate' | 'correctCount' | 'incorrectCount';
type SortDirection = 'asc' | 'desc';

export default function QuestionPerformancePage() {
  // State for filters
  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  // State for data
  const [performanceData, setPerformanceData] = useState<QuestionPerformance[]>([]);

  // State for sorting
  const [sortField, setSortField] = useState<SortField>('questionNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // State for modal
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('exams').select('id, title').order('title');
      setExams(data || []);
    };
    fetchExams();
  }, []);

  // Fetch question performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      const supabase = createClient();

      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));
      const endDate = endOfDay(new Date());

      // Define types for the query result
      interface AttemptAnswerData {
        id: string;
        question_id: string;
        is_correct: boolean | null;
        awarded_marks: number | null;
        attempt: {
          id: string;
          exam_id: string;
          submitted_at: string;
          status: string;
        } | null;
        question: {
          id: string;
          question_number: number;
          prompt: string;
          marks: number;
          exam_id: string;
          exam: {
            id: string;
            title: string;
          } | null;
        } | null;
      }

      // Build query for attempt answers with joins
      let query = supabase
        .from('attempt_answers')
        .select(`
          id,
          question_id,
          is_correct,
          awarded_marks,
          attempt:attempts!inner (
            id,
            exam_id,
            submitted_at,
            status
          ),
          question:questions!inner (
            id,
            question_number,
            prompt,
            marks,
            exam_id,
            exam:exams!inner (
              id,
              title
            )
          )
        `)
        .eq('attempt.status', 'submitted')
        .gte('attempt.submitted_at', startDate.toISOString())
        .lte('attempt.submitted_at', endDate.toISOString());

      // Filter by exam if selected
      if (selectedExamId) {
        query = query.eq('question.exam_id', selectedExamId);
      }

      const { data: rawAnswers, error } = await query;

      if (error) {
        console.error('Error fetching question performance:', error);
        setLoading(false);
        return;
      }

      const answers = rawAnswers as unknown as AttemptAnswerData[];

      // Aggregate data by question
      const performanceMap = new Map<string, QuestionPerformance>();

      (answers || []).forEach((answer) => {
        const question = answer.question;
        if (!question || !question.exam) return;

        const existing = performanceMap.get(question.id) || {
          questionId: question.id,
          questionNumber: question.question_number,
          prompt: question.prompt,
          marks: question.marks,
          examId: question.exam_id,
          examTitle: question.exam.title,
          totalAttempts: 0,
          correctCount: 0,
          incorrectCount: 0,
          successRate: 0,
        };

        existing.totalAttempts++;
        if (answer.is_correct) {
          existing.correctCount++;
        } else {
          existing.incorrectCount++;
        }
        existing.successRate = Math.round((existing.correctCount / existing.totalAttempts) * 100);

        performanceMap.set(question.id, existing);
      });

      setPerformanceData(Array.from(performanceMap.values()));
      setLoading(false);
    };

    fetchPerformanceData();
  }, [selectedExamId, dateRange]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (performanceData.length === 0) {
      return {
        totalAnswers: 0,
        avgSuccessRate: 0,
        hardestQuestion: null as QuestionPerformance | null,
        easiestQuestion: null as QuestionPerformance | null,
      };
    }

    const totalAnswers = performanceData.reduce((sum, q) => sum + q.totalAttempts, 0);
    const avgSuccessRate = Math.round(
      performanceData.reduce((sum, q) => sum + q.successRate, 0) / performanceData.length
    );

    // Find hardest (lowest success rate) and easiest (highest success rate)
    const sorted = [...performanceData].sort((a, b) => a.successRate - b.successRate);
    const hardestQuestion = sorted[0] || null;
    const easiestQuestion = sorted[sorted.length - 1] || null;

    return { totalAnswers, avgSuccessRate, hardestQuestion, easiestQuestion };
  }, [performanceData]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...performanceData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });
  }, [performanceData, sortField, sortDirection]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Prepare chart data (top 10 questions by attempt count)
  const chartData = useMemo(() => {
    return [...performanceData]
      .sort((a, b) => b.totalAttempts - a.totalAttempts)
      .slice(0, 15)
      .map((q) => ({
        name: `Q${q.questionNumber}`,
        successRate: q.successRate,
        correct: q.correctCount,
        incorrect: q.incorrectCount,
      }));
  }, [performanceData]);

  // Fetch question detail for modal
  const fetchQuestionDetail = async (questionId: string) => {
    setLoadingDetail(true);
    const supabase = createClient();

    const daysAgo = parseInt(dateRange);
    const startDate = startOfDay(subDays(new Date(), daysAgo));
    const endDate = endOfDay(new Date());

    // Define type for question query result
    interface QuestionQueryResult {
      id: string;
      question_number: number;
      prompt: string;
      marks: number;
      explanation: string | null;
      exam_id: string;
      exam: { id: string; title: string } | null;
      options: {
        id: string;
        label: string;
        text: string;
        is_correct: boolean;
        display_order: number;
      }[];
    }

    // Get question details with options
    const { data: rawQuestionData } = await supabase
      .from('questions')
      .select(`
        id,
        question_number,
        prompt,
        marks,
        explanation,
        exam_id,
        exam:exams (
          id,
          title
        ),
        options (
          id,
          label,
          text,
          is_correct,
          display_order
        )
      `)
      .eq('id', questionId)
      .single();

    const questionData = rawQuestionData as unknown as QuestionQueryResult | null;

    if (!questionData) {
      setLoadingDetail(false);
      return;
    }

    // Get answer distribution for this question in the date range
    const { data: answerData } = await supabase
      .from('attempt_answers')
      .select(`
        id,
        selected_option_id,
        is_correct,
        attempt:attempts!inner (
          submitted_at,
          status
        )
      `)
      .eq('question_id', questionId)
      .eq('attempt.status', 'submitted')
      .gte('attempt.submitted_at', startDate.toISOString())
      .lte('attempt.submitted_at', endDate.toISOString());

    // Calculate option selection frequencies
    const optionCounts = new Map<string, number>();
    (answerData || []).forEach((answer: any) => {
      if (answer.selected_option_id) {
        optionCounts.set(
          answer.selected_option_id,
          (optionCounts.get(answer.selected_option_id) || 0) + 1
        );
      }
    });

    const totalSelections = answerData?.length || 0;
    const options = (questionData.options || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((opt) => ({
        optionId: opt.id,
        label: opt.label,
        text: opt.text,
        isCorrect: opt.is_correct,
        selectionCount: optionCounts.get(opt.id) || 0,
        selectionPercentage:
          totalSelections > 0
            ? Math.round(((optionCounts.get(opt.id) || 0) / totalSelections) * 100)
            : 0,
      }));

    const exam = questionData.exam;
    const performanceItem = performanceData.find((p) => p.questionId === questionId);

    setSelectedQuestion({
      questionId: questionData.id,
      questionNumber: questionData.question_number,
      prompt: questionData.prompt,
      marks: questionData.marks,
      examId: questionData.exam_id,
      examTitle: exam?.title || '',
      totalAttempts: performanceItem?.totalAttempts || totalSelections,
      correctCount: performanceItem?.correctCount || 0,
      incorrectCount: performanceItem?.incorrectCount || 0,
      successRate: performanceItem?.successRate || 0,
      explanation: questionData.explanation || '',
      options,
    });

    setLoadingDetail(false);
    setModalOpen(true);
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Question Performance' },
        ]}
      />

      <PageHeader
        title="Question Performance Analytics"
        description="Analyze how each question performs - identify difficult questions and common mistakes"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          label="Exam"
          options={[
            { value: '', label: 'All Exams' },
            ...exams.map((exam) => ({
              value: exam.id,
              label: exam.title,
            })),
          ]}
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="w-64"
        />
        <Select
          label="Time Period"
          options={[
            { value: '1', label: 'Today' },
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: '365', label: 'Last year' },
          ]}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Answers</p>
              <p className="text-2xl font-semibold">{summaryStats.totalAnswers.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Success Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{summaryStats.avgSuccessRate}%</p>
                {summaryStats.avgSuccessRate >= 70 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hardest Question</p>
              {summaryStats.hardestQuestion ? (
                <p className="text-lg font-semibold">
                  Q{summaryStats.hardestQuestion.questionNumber}{' '}
                  <span className="text-sm text-red-600">
                    ({summaryStats.hardestQuestion.successRate}%)
                  </span>
                </p>
              ) : (
                <p className="text-gray-400">No data</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Easiest Question</p>
              {summaryStats.easiestQuestion ? (
                <p className="text-lg font-semibold">
                  Q{summaryStats.easiestQuestion.questionNumber}{' '}
                  <span className="text-sm text-emerald-600">
                    ({summaryStats.easiestQuestion.successRate}%)
                  </span>
                </p>
              ) : (
                <p className="text-gray-400">No data</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Question</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="name" type="category" width={40} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Success Rate']}
                      labelFormatter={(label) => `Question ${label}`}
                    />
                    <Bar dataKey="successRate" name="Success Rate" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSuccessRateColor(entry.successRate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Correct vs Incorrect Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Correct vs Incorrect Answers</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={40} />
                    <Tooltip />
                    <Bar dataKey="correct" name="Correct" fill="#22c55e" stackId="a" />
                    <Bar dataKey="incorrect" name="Incorrect" fill="#ef4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance Details</CardTitle>
        </CardHeader>
        <CardBody>
          {sortedData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('questionNumber')}
                    >
                      Q# <SortIcon field="questionNumber" />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Question</th>
                    {!selectedExamId && (
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Exam</th>
                    )}
                    <th
                      className="text-center py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('totalAttempts')}
                    >
                      Attempts <SortIcon field="totalAttempts" />
                    </th>
                    <th
                      className="text-center py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('correctCount')}
                    >
                      Correct <SortIcon field="correctCount" />
                    </th>
                    <th
                      className="text-center py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('incorrectCount')}
                    >
                      Incorrect <SortIcon field="incorrectCount" />
                    </th>
                    <th
                      className="text-center py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('successRate')}
                    >
                      Success Rate <SortIcon field="successRate" />
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((question) => (
                    <tr
                      key={question.questionId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium">{question.questionNumber}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="truncate" title={question.prompt}>
                          {question.prompt.length > 60
                            ? `${question.prompt.substring(0, 60)}...`
                            : question.prompt}
                        </p>
                      </td>
                      {!selectedExamId && (
                        <td className="py-3 px-4 text-gray-600">{question.examTitle}</td>
                      )}
                      <td className="py-3 px-4 text-center">{question.totalAttempts}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {question.correctCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          {question.incorrectCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getSuccessRateBadgeVariant(question.successRate)}>
                          {question.successRate}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchQuestionDetail(question.questionId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No question performance data available for the selected filters
            </div>
          )}
        </CardBody>
      </Card>

      {/* Question Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Question ${selectedQuestion?.questionNumber} - Detail Analysis`}
        size="lg"
      >
        {loadingDetail ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : selectedQuestion ? (
          <div className="space-y-6">
            {/* Question Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Question</h4>
              <p className="text-gray-900">{selectedQuestion.prompt}</p>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {selectedQuestion.totalAttempts}
                </p>
                <p className="text-sm text-gray-500">Total Attempts</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{selectedQuestion.correctCount}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{selectedQuestion.incorrectCount}</p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
            </div>

            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <Badge variant={getSuccessRateBadgeVariant(selectedQuestion.successRate)}>
                  {selectedQuestion.successRate}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${selectedQuestion.successRate}%`,
                    backgroundColor: getSuccessRateColor(selectedQuestion.successRate),
                  }}
                />
              </div>
            </div>

            {/* Option Analysis */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Answer Distribution</h4>
              <div className="space-y-3">
                {selectedQuestion.options.map((option) => (
                  <div
                    key={option.optionId}
                    className={`p-3 rounded-lg border ${
                      option.isCorrect
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span
                          className={`font-medium ${
                            option.isCorrect ? 'text-green-600' : 'text-gray-600'
                          }`}
                        >
                          {option.label}.
                        </span>
                        <span className="text-gray-900">{option.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {option.isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={option.isCorrect ? 'success' : 'default'}>
                          {option.selectionCount} ({option.selectionPercentage}%)
                        </Badge>
                      </div>
                    </div>
                    {/* Selection bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          option.isCorrect ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${option.selectionPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {selectedQuestion.explanation && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Explanation</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {selectedQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
