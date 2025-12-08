import Link from 'next/link';
import {
  BookOpen,
  HelpCircle,
  BarChart3,
  Users,
  FileText,
  Download,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { StatCard } from '@/components/charts';
import { formatDateTime, formatPercentage } from '@/lib/utils';

async function getDashboardStats() {
  const supabase = await createClient();

  // Get counts
  const [examsResult, questionsResult, usersResult, attemptsResult] = await Promise.all([
    (supabase as any).from('exams').select('id, is_active', { count: 'exact' }),
    (supabase as any).from('questions').select('id', { count: 'exact' }),
    (supabase as any).from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
    (supabase as any).from('attempts').select('id, status, passed', { count: 'exact' }),
  ]);

  interface ExamRow { id: string; is_active: boolean }
  interface AttemptRow { id: string; status: string; passed: boolean | null }

  const totalExams = examsResult.count || 0;
  const activeExams = (examsResult.data as ExamRow[] | null)?.filter(e => e.is_active).length || 0;
  const totalQuestions = questionsResult.count || 0;
  const totalStudents = usersResult.count || 0;
  const totalAttempts = attemptsResult.count || 0;
  const completedAttempts = (attemptsResult.data as AttemptRow[] | null)?.filter(a => a.status === 'submitted').length || 0;
  const passedAttempts = (attemptsResult.data as AttemptRow[] | null)?.filter(a => a.passed).length || 0;
  const passRate = completedAttempts > 0 ? (passedAttempts / completedAttempts) * 100 : 0;

  // Get recent attempts
  const { data: recentAttempts } = await (supabase as any)
    .from('attempts')
    .select(`
      id,
      submitted_at,
      raw_score,
      passed,
      status,
      exam:exams(title, total_marks),
      profile:profiles(full_name, email)
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(5);

  return {
    stats: {
      totalExams,
      activeExams,
      totalQuestions,
      totalStudents,
      totalAttempts,
      passRate,
    },
    recentAttempts: recentAttempts || [],
  };
}

export default async function DashboardPage() {
  const { stats, recentAttempts } = await getDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of the IRA IFRS 17 Examination System"
        actions={
          <Link href="/exams/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Create Exam
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Exams"
          value={`${stats.activeExams}/${stats.totalExams}`}
          icon={BookOpen}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={HelpCircle}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          iconColor="text-green-600 bg-green-100"
        />
        <StatCard
          title="Pass Rate"
          value={formatPercentage(stats.passRate)}
          icon={TrendingUp}
          iconColor="text-orange-600 bg-orange-100"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Link href="/exams/new" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create New Exam</p>
                  <p className="text-sm text-gray-500">Set up a new examination</p>
                </div>
              </div>
            </Link>
            <Link href="/questions/import" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Import Questions</p>
                  <p className="text-sm text-gray-500">Bulk import from CSV</p>
                </div>
              </div>
            </Link>
            <Link href="/results" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Results</p>
                  <p className="text-sm text-gray-500">View and export exam results</p>
                </div>
              </div>
            </Link>
            <Link href="/users" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View all users</p>
                </div>
              </div>
            </Link>
          </CardBody>
        </Card>

        {/* Recent Attempts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Attempts</CardTitle>
            <Link href="/results">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardBody>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No exam attempts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAttempts.map((attempt: any) => {
                  const score = attempt.raw_score || 0;
                  const totalMarks = attempt.exam?.total_marks || 100;
                  const percentage = Math.round((score / totalMarks) * 100);
                  
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            attempt.passed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {attempt.passed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {attempt.profile?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {attempt.exam?.title || 'Unknown Exam'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={attempt.passed ? 'success' : 'danger'}>
                          {percentage}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {attempt.submitted_at
                            ? formatDateTime(attempt.submitted_at)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            <p className="text-sm text-gray-500">Total Exams</p>
            <Link href="/exams" className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                Manage Exams
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            <p className="text-sm text-gray-500">Questions in Bank</p>
            <Link href="/questions" className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                Question Bank
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
            <p className="text-sm text-gray-500">Total Attempts</p>
            <Link href="/results" className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                View Results
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
