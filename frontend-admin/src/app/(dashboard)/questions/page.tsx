'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout';
import { DataTable } from '@/components/tables';
import {
  Button,
  Badge,
  Card,
  CardBody,
  Select,
  Modal,
  ModalFooter,
} from '@/components/ui';
import { truncateText } from '@/lib/utils';
import type { Question, Exam } from '@/types/database';

interface QuestionWithExam extends Question {
  exam: Pick<Exam, 'id' | 'title'>;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithExam[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionWithExam | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch exams for filter
    const { data: examsData } = await supabase
      .from('exams')
      .select('id, title')
      .order('title');

    setExams(examsData || []);

    // Fetch questions
    let query = supabase
      .from('questions')
      .select('*, exam:exams(id, title)')
      .order('question_number', { ascending: true });

    if (examFilter !== 'all') {
      query = query.eq('exam_id', examFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load questions');
      console.error(error);
    } else {
      setQuestions(data as QuestionWithExam[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [examFilter]);

  const handleDelete = async () => {
    if (!questionToDelete) return;

    setDeleting(true);
    const supabase = createClient();

    // Delete options first
    await (supabase as any)
      .from('options')
      .delete()
      .eq('question_id', questionToDelete.id);

    // Delete question
    const { error } = await (supabase as any)
      .from('questions')
      .delete()
      .eq('id', questionToDelete.id);

    if (error) {
      toast.error('Failed to delete question');
    } else {
      toast.success('Question deleted successfully');
      fetchData();
    }

    setDeleting(false);
    setDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const columns: ColumnDef<QuestionWithExam>[] = useMemo(
    () => [
      {
        accessorKey: 'question_number',
        header: '#',
        cell: ({ row }) => (
          <span className="font-medium">Q{row.original.question_number}</span>
        ),
      },
      {
        accessorKey: 'prompt',
        header: 'Question',
        cell: ({ row }) => (
          <p className="text-gray-700">{truncateText(row.original.prompt, 100)}</p>
        ),
      },
      {
        id: 'exam',
        header: 'Exam',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.exam?.title || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'marks',
        header: 'Marks',
        cell: ({ row }) => <Badge variant="info">{row.original.marks}</Badge>,
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
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/questions/${row.original.id}`);
              }}
              title="Edit Question"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setQuestionToDelete(row.original);
                setDeleteModalOpen(true);
              }}
              title="Delete Question"
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
        title="Question Bank"
        description="Manage all examination questions"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/questions/import">
              <Button variant="outline" leftIcon={<FileUp className="h-4 w-4" />}>
                Import
              </Button>
            </Link>
            <Link href="/questions/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Question
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <Select
              options={[
                { value: 'all', label: 'All Exams' },
                ...exams.map((exam) => ({
                  value: exam.id,
                  label: exam.title,
                })),
              ]}
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-64"
            />
          </div>

          <DataTable
            columns={columns}
            data={questions}
            searchColumn="prompt"
            searchPlaceholder="Search questions..."
            loading={loading}
            emptyMessage="No questions found."
            onRowClick={(question) => router.push(`/questions/${question.id}`)}
          />
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        title="Delete Question"
        description="Are you sure you want to delete this question?"
      >
        <div className="py-4">
          <p className="text-gray-600">
            <strong>Q{questionToDelete?.question_number}:</strong>{' '}
            {truncateText(questionToDelete?.prompt || '', 100)}
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setQuestionToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete Question
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
