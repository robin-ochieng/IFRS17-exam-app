'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { DataTable } from '@/components/tables';
import {
  Button,
  Select,
  Badge,
  LoadingSpinner,
} from '@/components/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { Exam } from '@/types/database';

interface AttemptWithDetails {
  id: string;
  exam_id: string;
  user_id: string;
  raw_score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
  status: string;
  profile: {
    full_name: string | null;
    email: string | null;
    organisation: string | null;
  };
  exam: {
    title: string;
    total_marks: number;
    pass_mark_percent: number;
  };
}

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch exams for filter
      const { data: examsData } = await supabase
        .from('exams')
        .select('id, title')
        .order('title');
      setExams(examsData || []);

      // Fetch attempts with related data
      let query = supabase
        .from('attempts')
        .select(`
          id,
          exam_id,
          user_id,
          raw_score,
          passed,
          started_at,
          submitted_at,
          status,
          profile:profiles!attempts_user_id_fkey (
            full_name,
            email,
            organisation
          ),
          exam:exams!attempts_exam_id_fkey (
            title,
            total_marks,
            pass_mark_percent
          )
        `)
        .order('started_at', { ascending: false });

      if (examFilter) {
        query = query.eq('exam_id', examFilter);
      }

      if (statusFilter === 'completed') {
        query = query.eq('status', 'submitted');
      } else if (statusFilter === 'in_progress') {
        query = query.eq('status', 'in_progress');
      } else if (statusFilter === 'passed') {
        query = query.eq('passed', true);
      } else if (statusFilter === 'failed') {
        query = query.eq('passed', false).eq('status', 'submitted');
      }

      const { data: attemptsData } = await query;
      setAttempts((attemptsData as unknown as AttemptWithDetails[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [examFilter, statusFilter]);

  const columns: ColumnDef<AttemptWithDetails>[] = [
    {
      accessorKey: 'profile.full_name',
      header: 'Candidate',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.profile?.full_name || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500">
            {row.original.profile?.email || 'No email'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'exam.title',
      header: 'Exam',
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.exam?.title || 'Unknown Exam'}
        </span>
      ),
    },
    {
      accessorKey: 'started_at',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Started
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {format(new Date(row.original.started_at), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        if (row.original.status !== 'submitted') {
          return <Badge variant="warning">In Progress</Badge>;
        }
        if (row.original.passed) {
          return <Badge variant="success">Passed</Badge>;
        }
        return <Badge variant="danger">Failed</Badge>;
      },
    },
    {
      accessorKey: 'raw_score',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Score
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => {
        if (row.original.status !== 'submitted') {
          return <span className="text-gray-400">--</span>;
        }
        const score = row.original.raw_score || 0;
        const total = row.original.exam?.total_marks || 100;
        const percentage = Math.round((score / total) * 100);
        return (
          <div>
            <span className="font-medium">{score}/{total}</span>
            <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/results/${row.original.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const handleExportCSV = () => {
    const csvData = attempts.map((attempt) => ({
      Candidate: attempt.profile?.full_name || 'Unknown',
      Email: attempt.profile?.email || '',
      Organisation: attempt.profile?.organisation || '',
      Exam: attempt.exam?.title || '',
      Started: format(new Date(attempt.started_at), 'yyyy-MM-dd HH:mm'),
      Submitted: attempt.submitted_at
        ? format(new Date(attempt.submitted_at), 'yyyy-MM-dd HH:mm')
        : '',
      Status: attempt.status === 'submitted'
        ? attempt.passed
          ? 'Passed'
          : 'Failed'
        : 'In Progress',
      Score: attempt.raw_score || '',
      'Total Marks': attempt.exam?.total_marks || '',
      'Pass Mark %': attempt.exam?.pass_mark_percent || '',
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter((a) => a.status === 'submitted').length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const passRate = completedAttempts > 0
    ? Math.round((passedAttempts / completedAttempts) * 100)
    : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Results' }]} />

      <div className="flex items-center justify-between">
        <PageHeader
          title="Exam Results"
          description="View and analyze exam attempt results"
        />
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Attempts</p>
          <p className="text-2xl font-semibold">{totalAttempts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold">{completedAttempts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Passed</p>
          <p className="text-2xl font-semibold text-green-600">{passedAttempts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Pass Rate</p>
          <p className="text-2xl font-semibold">{passRate}%</p>
        </div>
      </div>

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
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="w-64"
        />
        <Select
          label="Status"
          options={[
            { value: '', label: 'All Status' },
            { value: 'completed', label: 'Completed' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'passed', label: 'Passed' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Results Table */}
      <DataTable
        columns={columns}
        data={attempts}
        searchPlaceholder="Search by candidate name..."
      />
    </div>
  );
}
