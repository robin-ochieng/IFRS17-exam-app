'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Select,
  LoadingSpinner,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrendingUp, TrendingDown, Users, Award, BookOpen, Clock } from 'lucide-react';
import type { Exam } from '@/types/database';

interface ExamStats {
  examId: string;
  examTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  avgScore: number;
  avgDuration: number;
}

interface DailyStats {
  date: string;
  attempts: number;
  passed: number;
  failed: number;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    examStats: ExamStats[];
    dailyStats: DailyStats[];
    totalUsers: number;
    totalAttempts: number;
    overallPassRate: number;
    avgScore: number;
  }>({
    examStats: [],
    dailyStats: [],
    totalUsers: 0,
    totalAttempts: 0,
    overallPassRate: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const fetchExams = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('exams').select('id, title').order('title');
      setExams(data || []);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const supabase = createClient();

      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));
      const endDate = endOfDay(new Date());

      // Define attempt type based on actual database schema
      interface AttemptData {
        id: string;
        exam_id: string;
        user_id: string;
        raw_score: number | null;
        percent_score: number | null;
        passed: boolean | null;
        started_at: string;
        submitted_at: string | null;
        status: 'in_progress' | 'submitted' | 'expired';
        time_taken_seconds: number | null;
        exam: {
          id: string;
          title: string;
          total_marks: number;
        } | null;
      }

      // Build base query with correct field names from database schema
      let attemptQuery = supabase
        .from('attempts')
        .select(`
          id,
          exam_id,
          user_id,
          raw_score,
          percent_score,
          passed,
          started_at,
          submitted_at,
          status,
          time_taken_seconds,
          exam:exams!attempts_exam_id_fkey (
            id,
            title,
            total_marks
          )
        `)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (selectedExamId) {
        attemptQuery = attemptQuery.eq('exam_id', selectedExamId);
      }

      const { data: rawAttempts, error: attemptsError } = await attemptQuery;
      
      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
      }
      
      const attempts = rawAttempts as unknown as AttemptData[] | null;

      // Get unique users (students)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');

      // Calculate exam-specific stats
      const examStatsMap = new Map<string, ExamStats>();
      (attempts || []).forEach((attempt) => {
        const exam = attempt.exam;
        if (!exam) return;

        const existing = examStatsMap.get(exam.id) || {
          examId: exam.id,
          examTitle: exam.title,
          totalAttempts: 0,
          completedAttempts: 0,
          passedAttempts: 0,
          avgScore: 0,
          avgDuration: 0,
        };

        existing.totalAttempts++;
        // Check if attempt is completed (status is 'submitted' or 'expired')
        const isCompleted = attempt.status === 'submitted' || attempt.status === 'expired';
        if (isCompleted) {
          existing.completedAttempts++;
          if (attempt.passed) {
            existing.passedAttempts++;
          }
          // Use percent_score directly (it's already a percentage)
          if (attempt.percent_score !== null) {
            existing.avgScore =
              (existing.avgScore * (existing.completedAttempts - 1) + attempt.percent_score) /
              existing.completedAttempts;
          }
          // Calculate average duration if available
          if (attempt.time_taken_seconds !== null) {
            existing.avgDuration =
              (existing.avgDuration * (existing.completedAttempts - 1) + attempt.time_taken_seconds) /
              existing.completedAttempts;
          }
        }

        examStatsMap.set(exam.id, existing);
      });

      // Calculate daily stats
      const dailyStatsMap = new Map<string, DailyStats>();
      for (let i = 0; i <= daysAgo; i++) {
        const date = format(subDays(new Date(), i), 'MMM d');
        dailyStatsMap.set(date, { date, attempts: 0, passed: 0, failed: 0 });
      }

      (attempts || []).forEach((attempt) => {
        const date = format(new Date(attempt.started_at), 'MMM d');
        const existing = dailyStatsMap.get(date);
        if (existing) {
          existing.attempts++;
          // Check if attempt is completed (status is 'submitted' or 'expired')
          const isCompleted = attempt.status === 'submitted' || attempt.status === 'expired';
          if (isCompleted) {
            if (attempt.passed) {
              existing.passed++;
            } else {
              existing.failed++;
            }
          }
        }
      });

      // Calculate overall stats
      const completedAttempts = (attempts || []).filter(
        (a) => a.status === 'submitted' || a.status === 'expired'
      );
      const passedAttempts = completedAttempts.filter((a) => a.passed);
      // Use percent_score directly for average calculation
      const totalScore = completedAttempts.reduce((sum, a) => {
        if (a.percent_score !== null) {
          return sum + a.percent_score;
        }
        return sum;
      }, 0);

      setStats({
        examStats: Array.from(examStatsMap.values()),
        dailyStats: Array.from(dailyStatsMap.values()).reverse(),
        totalUsers: totalUsers || 0,
        totalAttempts: (attempts || []).length,
        overallPassRate:
          completedAttempts.length > 0
            ? Math.round((passedAttempts.length / completedAttempts.length) * 100)
            : 0,
        avgScore:
          completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0,
      });

      setLoading(false);
    };

    fetchStats();
  }, [selectedExamId, dateRange]);

  // Prepare pie chart data
  const pieData = [
    { name: 'Passed', value: stats.examStats.reduce((sum, e) => sum + e.passedAttempts, 0) },
    {
      name: 'Failed',
      value:
        stats.examStats.reduce((sum, e) => sum + e.completedAttempts, 0) -
        stats.examStats.reduce((sum, e) => sum + e.passedAttempts, 0),
    },
    {
      name: 'In Progress',
      value:
        stats.examStats.reduce((sum, e) => sum + e.totalAttempts, 0) -
        stats.examStats.reduce((sum, e) => sum + e.completedAttempts, 0),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Analytics' }]} />

      <PageHeader
        title="Analytics Dashboard"
        description="Exam performance metrics and insights"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-semibold">{stats.totalAttempts}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pass Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{stats.overallPassRate}%</p>
                {stats.overallPassRate >= 70 ? (
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
            <div className="p-3 rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-semibold">{stats.avgScore}%</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attempts Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Attempt Trends</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attempts"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Attempts"
                  />
                  <Line
                    type="monotone"
                    dataKey="passed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Passed"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attempt Status Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Exam Performance Comparison */}
      {stats.examStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Performance Comparison</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.examStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="examTitle"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
                  <Legend />
                  <Bar
                    dataKey="avgScore"
                    fill="#3b82f6"
                    name="Avg Score %"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Exam Details Table */}
      {stats.examStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Statistics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Exam</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      Total Attempts
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Passed</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      Pass Rate
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.examStats.map((exam) => {
                    const passRate =
                      exam.completedAttempts > 0
                        ? Math.round((exam.passedAttempts / exam.completedAttempts) * 100)
                        : 0;
                    return (
                      <tr key={exam.examId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{exam.examTitle}</td>
                        <td className="px-4 py-3 text-center">{exam.totalAttempts}</td>
                        <td className="px-4 py-3 text-center">{exam.completedAttempts}</td>
                        <td className="px-4 py-3 text-center text-green-600">
                          {exam.passedAttempts}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                              passRate >= 70
                                ? 'bg-green-100 text-green-700'
                                : passRate >= 50
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {passRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{Math.round(exam.avgScore)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
