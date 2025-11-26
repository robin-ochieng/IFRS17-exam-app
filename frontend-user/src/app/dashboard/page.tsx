'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { LogOut, User, BookOpen, Award, Clock } from 'lucide-react';
import Image from 'next/image';
import type { Exam, Attempt } from '@/types/database';

interface ExamWithAttempts extends Exam {
  attempts: Attempt[];
}

export default function DashboardPage() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [exams, setExams] = useState<ExamWithAttempts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchExams = async () => {
      if (!user) return;

      try {
        // First, get all active exams
        const { data: examsData, error: examsError } = await supabase
          .from('exams')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (examsError) {
          console.error('Error fetching exams:', examsError);
          setIsLoading(false);
          return;
        }

        // Then, get user's attempts for these exams
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('attempts')
          .select('id, exam_id, status, raw_score, percent_score, passed, started_at, submitted_at')
          .eq('user_id', user.id);

        if (attemptsError) {
          console.error('Error fetching attempts:', attemptsError);
          // Continue without attempts data
        }

        // Combine exams with their attempts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const examsWithAttempts: ExamWithAttempts[] = (examsData || []).map((exam: any) => ({
          ...exam,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attempts: (attemptsData || []).filter((attempt: any) => attempt.exam_id === exam.id)
        }));

        setExams(examsWithAttempts);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchExams();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (authLoading || isLoading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  const getExamStatus = (exam: ExamWithAttempts) => {
    const completedAttempt = exam.attempts.find(a => a.status === 'completed');
    const inProgressAttempt = exam.attempts.find(a => a.status === 'in_progress');
    
    if (completedAttempt) {
      return {
        status: 'completed',
        passed: completedAttempt.passed,
        score: completedAttempt.score,
        label: completedAttempt.passed ? 'Passed' : 'Failed',
        color: completedAttempt.passed ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100',
      };
    }
    
    if (inProgressAttempt) {
      return {
        status: 'in_progress',
        passed: null,
        score: null,
        label: 'In Progress',
        color: 'text-yellow-600 bg-yellow-100',
      };
    }
    
    if (exam.max_attempts && exam.attempts.length >= exam.max_attempts) {
      return {
        status: 'exhausted',
        passed: null,
        score: null,
        label: 'No Attempts Left',
        color: 'text-gray-600 bg-gray-100',
      };
    }
    
    return {
      status: 'available',
      passed: null,
      score: null,
      label: 'Available',
      color: 'text-blue-600 bg-blue-100',
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50/40">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/IRA logo.png"
                  alt="IRA IFRS 17 Exam"
                  width={200}
                  height={52}
                  className="h-14 w-auto cursor-pointer"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-full">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-sm">{profile?.full_name || user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] || 'Student'}</span>!
          </h1>
          <p className="mt-3 text-lg text-gray-600">Select an exam to begin your assessment.</p>
        </div>

        {/* Exam Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {exams.length === 0 ? (
            <Card className="col-span-full border-0 shadow-xl bg-white rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <BookOpen className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-gray-500 text-lg">No exams available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => {
              const examStatus = getExamStatus(exam);
              
              return (
                <Card key={exam.id} className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
                  {/* Status Banner */}
                  <div className={`px-6 py-2 text-center text-xs font-bold uppercase tracking-wider ${
                    examStatus.status === 'in_progress' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' :
                    examStatus.status === 'completed' ? (examStatus.passed ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-400 to-rose-500 text-white') :
                    examStatus.status === 'exhausted' ? 'bg-gray-200 text-gray-600' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    {examStatus.label}
                  </div>
                  
                  <CardHeader className="pt-6 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-3 text-gray-500 leading-relaxed">
                      {exam.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-5">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-xl">
                          <Clock className="h-5 w-5 text-blue-500 mb-1" />
                          <span className="text-lg font-bold text-gray-900">{exam.duration_minutes}</span>
                          <span className="text-xs text-gray-500">minutes</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-amber-50 rounded-xl">
                          <Award className="h-5 w-5 text-amber-500 mb-1" />
                          <span className="text-lg font-bold text-gray-900">{exam.total_marks}</span>
                          <span className="text-xs text-gray-500">marks</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-green-50 rounded-xl">
                          <svg className="h-5 w-5 text-green-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-lg font-bold text-gray-900">{exam.pass_mark_percent}%</span>
                          <span className="text-xs text-gray-500">to pass</span>
                        </div>
                      </div>
                      
                      {examStatus.status === 'completed' && examStatus.score !== null && (
                        <div className={`text-center py-4 px-4 rounded-xl font-semibold ${examStatus.passed ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          <span className="text-2xl font-bold">{examStatus.score}/{exam.total_marks}</span>
                          <span className="ml-2 text-sm">({Math.round((examStatus.score / exam.total_marks) * 100)}%)</span>
                        </div>
                      )}

                      <div className="pt-1">
                        {examStatus.status === 'available' && (
                          <Button 
                            className="w-full py-6 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl"
                            onClick={() => router.push(`/exam/${exam.id}`)}
                          >
                            Start Exam
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Button>
                        )}
                        {examStatus.status === 'in_progress' && (
                          <Button 
                            className="w-full py-6 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl"
                            onClick={() => router.push(`/exam/${exam.id}`)}
                          >
                            Continue Exam
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Button>
                        )}
                        {examStatus.status === 'completed' && (
                          <Button 
                            variant="outline"
                            className="w-full py-6 text-base border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-xl transition-all"
                            onClick={() => router.push(`/exam/${exam.id}/results`)}
                          >
                            View Results
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </Button>
                        )}
                        {examStatus.status === 'exhausted' && (
                          <Button 
                            variant="secondary"
                            className="w-full py-6 text-base bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                            disabled
                          >
                            No Attempts Remaining
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
