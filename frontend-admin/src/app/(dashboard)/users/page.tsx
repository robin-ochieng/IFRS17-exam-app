'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Mail, MoreHorizontal, Shield, ShieldOff, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { DataTable } from '@/components/tables';
import {
  Button,
  Select,
  Badge,
  LoadingSpinner,
  Modal,
} from '@/components/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Profile } from '@/types/database';

interface UserWithStats extends Profile {
  attempts?: { count: number }[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    const supabase = createClient();

    let query = supabase
      .from('profiles')
      .select(`
        *,
        attempts (
          count
        )
      `)
      .order('created_at', { ascending: false });

    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const { data } = await query;
    setUsers((data as unknown as UserWithStats[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId: string, newRole: 'student' | 'admin' | 'super_admin') => {
    setUpdating(true);

    const supabase = createClient();
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success('User role updated successfully');
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    }

    setUpdating(false);
  };

  const columns: ColumnDef<UserWithStats>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name || 'Not set'}</p>
          <p className="text-sm text-gray-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'organisation',
      header: 'Organisation',
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.organisation || '--'}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge
            variant={
              role === 'super_admin'
                ? 'danger'
                : role === 'admin'
                ? 'warning'
                : 'info'
            }
          >
            {role === 'super_admin'
              ? 'Super Admin'
              : role === 'admin'
              ? 'Admin'
              : 'Student'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'attempts',
      header: 'Attempts',
      cell: ({ row }) => {
        const attempts = row.original.attempts?.[0]?.count || 0;
        return <span className="text-gray-600">{attempts}</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Joined
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {format(new Date(row.original.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/users/${row.original.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setIsRoleModalOpen(true);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate stats
  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;
  const regularUsers = users.filter((u) => u.role === 'student').length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Users' }]} />

      <div className="flex items-center justify-between">
        <PageHeader
          title="User Management"
          description="Manage user accounts and permissions"
        />
        <Link href="/users/invite">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Users
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold">{totalUsers}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Regular Users</p>
          <p className="text-2xl font-semibold">{regularUsers}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Administrators</p>
          <p className="text-2xl font-semibold">{admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          label="Role"
          options={[
            { value: '', label: 'All Roles' },
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
            { value: 'super_admin', label: 'Super Admin' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search by name..."
      />

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedUser.full_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Current role:{' '}
                <Badge
                  variant={
                    selectedUser.role === 'super_admin'
                      ? 'danger'
                      : selectedUser.role === 'admin'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {selectedUser.role}
                </Badge>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Select new role:</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'student')}
                  disabled={selectedUser.role === 'student' || updating}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <ShieldOff className="h-5 w-5 text-gray-500" />
                    <div className="text-left">
                      <p className="font-medium">Student</p>
                      <p className="text-sm text-gray-500">Can take exams only</p>
                    </div>
                  </div>
                  {selectedUser.role === 'student' && (
                    <Badge variant="info">Current</Badge>
                  )}
                </button>

                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                  disabled={selectedUser.role === 'admin' || updating}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-medium">Admin</p>
                      <p className="text-sm text-gray-500">Can manage exams and view results</p>
                    </div>
                  </div>
                  {selectedUser.role === 'admin' && (
                    <Badge variant="warning">Current</Badge>
                  )}
                </button>

                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'super_admin')}
                  disabled={selectedUser.role === 'super_admin' || updating}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-500" />
                    <div className="text-left">
                      <p className="font-medium">Super Admin</p>
                      <p className="text-sm text-gray-500">Full access to all features</p>
                    </div>
                  </div>
                  {selectedUser.role === 'super_admin' && (
                    <Badge variant="danger">Current</Badge>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
