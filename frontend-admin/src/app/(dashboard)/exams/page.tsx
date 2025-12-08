'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  MoreHorizontal,
  Power,
  PowerOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout';
import { DataTable } from '@/components/tables';
import {
  Button,
  Badge,
  Card,
  CardBody,
  Modal,
  ModalFooter,
  Select,
} from '@/components/ui';
import { formatDuration, formatDate } from '@/lib/utils';
import type { ExamWithQuestionCount } from '@/types/database';

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamWithQuestionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<ExamWithQuestionCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('exams')
      .select('*, questions(count)')
      .order('created_at', { ascending: false });

    if (statusFilter === 'active') {
      query = query.eq('is_active', true);
    } else if (statusFilter === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load exams');
      console.error(error);
    } else {
      setExams(data as ExamWithQuestionCount[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const toggleStatus = async (exam: ExamWithQuestionCount) => {
    const supabase = createClient();
    const newStatus = !exam.is_active;

    const { error } = await (supabase as any)
      .from('exams')
      .update({ is_active: newStatus })
      .eq('id', exam.id);

    if (error) {
      toast.error('Failed to update exam status');
    } else {
      toast.success(`Exam ${newStatus ? 'activated' : 'deactivated'}`);
      fetchExams();
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    setDeleting(true);
    const supabase = createClient();

    const { error } = await (supabase as any)
      .from('exams')
      .delete()
      .eq('id', examToDelete.id);

    if (error) {
      toast.error('Failed to delete exam. Make sure there are no attempts for this exam.');
    } else {
      toast.success('Exam deleted successfully');
      fetchExams();
    }

    setDeleting(false);
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  const columns: ColumnDef<ExamWithQuestionCount>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{row.original.title}</p>
            {row.original.description && (
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'questions',
        header: 'Questions',
        cell: ({ row }) => {
          const count = row.original.questions?.[0]?.count || 0;
          return (
            <span className="text-gray-600">
              {count} {count === 1 ? 'question' : 'questions'}
            </span>
          );
        },
      },
      {
        accessorKey: 'duration_minutes',
        header: 'Duration',
        cell: ({ row }) => formatDuration(row.original.duration_minutes),
      },
      {
        accessorKey: 'pass_mark_percent',
        header: 'Pass Mark',
        cell: ({ row }) => `${row.original.pass_mark_percent}%`,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/exams/${row.original.id}/questions`);
              }}
              title="Manage Questions"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/exams/${row.original.id}`);
              }}
              title="Edit Exam"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(row.original);
              }}
              title={row.original.is_active ? 'Deactivate' : 'Activate'}
            >
              {row.original.is_active ? (
                <PowerOff className="h-4 w-4 text-orange-500" />
              ) : (
                <Power className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExamToDelete(row.original);
                setDeleteModalOpen(true);
              }}
              title="Delete Exam"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Manage your examination catalog"
        actions={
          <Link href="/exams/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Create Exam
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <Select
              options={[
                { value: 'all', label: 'All Exams' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            />
          </div>

          <DataTable
            columns={columns}
            data={exams}
            searchColumn="title"
            searchPlaceholder="Search exams..."
            loading={loading}
            emptyMessage="No exams found. Create your first exam to get started."
            onRowClick={(exam) => router.push(`/exams/${exam.id}`)}
          />
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone."
      >
        <div className="py-4">
          <p className="text-gray-600">
            You are about to delete <strong>{examToDelete?.title}</strong>.
            All associated questions will also be deleted.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setExamToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete Exam
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
