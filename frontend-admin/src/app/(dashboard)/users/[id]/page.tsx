'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
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
  Modal,
  Select,
} from '@/components/ui';
import type { Profile, Attempt, Exam } from '@/types/database';

interface UserAttempt extends Attempt {
  exam: Pick<Exam, 'id' | 'title' | 'total_marks'>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch user profile
    const { data: userData, error: userError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      router.push('/users');
      return;
    }

    setUser(userData as Profile);
    setSelectedRole((userData as Profile).role);

    // Fetch user's exam attempts
    const { data: attemptsData } = await (supabase as any)
      .from('attempts')
      .select(`
        *,
        exam:exams (
          id,
          title,
          total_marks
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    setAttempts((attemptsData as unknown as UserAttempt[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId, router]);

  const handleRoleUpdate = async () => {
    if (!user || selectedRole === user.role) {
      setIsRoleModalOpen(false);
      return;
    }

    setUpdating(true);

    const supabase = createClient();
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role: selectedRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success('User role updated successfully');
      setUser({ ...user, role: selectedRole as 'student' | 'admin' | 'super_admin' });
      setIsRoleModalOpen(false);
    }

    setUpdating(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // Calculate stats
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter((a) => a.status === 'submitted').length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const passRate =
    completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;
  const avgScore =
    completedAttempts > 0
      ? Math.round(
          attempts
            .filter((a) => a.status === 'submitted' && a.raw_score !== null)
            .reduce((sum, a) => {
              const percentage = ((a.raw_score || 0) / (a.exam?.total_marks || 100)) * 100;
              return sum + percentage;
            }, 0) / completedAttempts
        )
      : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Users', href: '/users' },
          { label: user.full_name || user.email || 'User' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title={user.full_name || 'Unknown User'}
            description={user.email || ''}
          />
        </div>
        <Button variant="outline" onClick={() => setIsRoleModalOpen(true)}>
          <Shield className="h-4 w-4 mr-2" />
          Change Role
        </Button>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.full_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Organisation</p>
                  <p className="font-medium">{user.organisation || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {format(new Date(user.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge
                    variant={
                      user.role === 'super_admin'
                        ? 'danger'
                        : user.role === 'admin'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {user.role === 'super_admin'
                      ? 'Super Admin'
                      : user.role === 'admin'
                      ? 'Admin'
                      : 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-4xl font-bold">{passRate}%</p>
              <p className="text-sm text-gray-500">Pass Rate</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold">{totalAttempts}</p>
                <p className="text-gray-500">Total Attempts</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold">{completedAttempts}</p>
                <p className="text-gray-500">Completed</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="font-semibold text-green-700">{passedAttempts}</p>
                <p className="text-green-600">Passed</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="font-semibold text-blue-700">{avgScore}%</p>
                <p className="text-blue-600">Avg Score</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Exam Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
        </CardHeader>
        <CardBody>
          {attempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exam attempts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Exam</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Started</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Score</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => {
                    const percentage =
                      attempt.raw_score && attempt.exam?.total_marks
                        ? Math.round((attempt.raw_score / attempt.exam.total_marks) * 100)
                        : 0;
                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {attempt.exam?.title || 'Unknown Exam'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(attempt.started_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attempt.status !== 'submitted' ? (
                            <Badge variant="warning">In Progress</Badge>
                          ) : attempt.passed ? (
                            <Badge variant="success">Passed</Badge>
                          ) : (
                            <Badge variant="danger">Failed</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attempt.status === 'submitted' ? (
                            <span>
                              {attempt.raw_score}/{attempt.exam?.total_marks} ({percentage}%)
                            </span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/results/${attempt.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Role"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{user.full_name || 'Unknown User'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <Select
            label="Role"
            options={[
              { value: 'user', label: 'User - Can take exams only' },
              { value: 'admin', label: 'Admin - Can manage exams and view results' },
              { value: 'super_admin', label: 'Super Admin - Full access' },
            ]}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} loading={updating}>
              Update Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
