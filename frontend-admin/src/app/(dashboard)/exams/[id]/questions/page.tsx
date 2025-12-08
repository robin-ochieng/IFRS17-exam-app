'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Modal,
  ModalFooter,
  LoadingSpinner,
  Alert,
} from '@/components/ui';
import { truncateText } from '@/lib/utils';
import type { Exam, QuestionWithOptions } from '@/types/database';

export default function ExamQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionWithOptions | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examError) {
      toast.error('Failed to load exam');
      router.push('/exams');
      return;
    }

    setExam(examData);

    // Fetch questions with options
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*, options(*)')
      .eq('exam_id', examId)
      .order('question_number', { ascending: true });

    if (questionsError) {
      toast.error('Failed to load questions');
    } else {
      setQuestions(questionsData as QuestionWithOptions[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!exam) {
    return null;
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Exams', href: '/exams' },
          { label: exam.title, href: `/exams/${examId}` },
          { label: 'Questions' },
        ]}
      />

      <PageHeader
        title="Manage Questions"
        description={`${exam.title} - ${questions.length} questions, ${totalMarks} total marks`}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/questions/import">
              <Button variant="outline">
                Import Questions
              </Button>
            </Link>
            <Link href={`/questions/new?exam_id=${examId}`}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Question
              </Button>
            </Link>
          </div>
        }
      />

      {/* Exam Info */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{exam.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Duration: {exam.duration_minutes} min • Pass: {exam.pass_mark_percent}% •
                Total: {exam.total_marks} marks
              </p>
            </div>
            <Badge variant={exam.is_active ? 'success' : 'default'}>
              {exam.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Warning if total marks don't match */}
      {totalMarks !== exam.total_marks && questions.length > 0 && (
        <Alert variant="warning" title="Marks Mismatch">
          The sum of question marks ({totalMarks}) does not match the exam total marks ({exam.total_marks}).
          Please update the exam settings or adjust question marks.
        </Alert>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              No questions added yet. Start by adding your first question.
            </p>
            <Link href={`/questions/new?exam_id=${examId}`}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add First Question
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => {
            const isExpanded = expandedQuestions.includes(question.id);
            const correctOption = question.options?.find((o) => o.is_correct);

            return (
              <Card key={question.id}>
                <CardBody>
                  <div className="flex items-start gap-4">
                    {/* Drag handle placeholder */}
                    <div className="pt-1 text-gray-400 cursor-move">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Question content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              Q{question.question_number}
                            </span>
                            <Badge variant="info">{question.marks} marks</Badge>
                          </div>
                          <p className="text-gray-700">
                            {isExpanded
                              ? question.prompt
                              : truncateText(question.prompt, 150)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(question.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/questions/${question.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setQuestionToDelete(question);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded options */}
                      {isExpanded && question.options && (
                        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                          {question.options
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-start gap-2 p-2 rounded ${
                                  option.is_correct
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className="font-medium text-gray-600">
                                  {option.label}.
                                </span>
                                <span
                                  className={
                                    option.is_correct
                                      ? 'text-green-700'
                                      : 'text-gray-700'
                                  }
                                >
                                  {option.text}
                                </span>
                                {option.is_correct && (
                                  <Badge variant="success" className="ml-auto">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            ))}

                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">
                                Explanation:
                              </p>
                              <p className="text-sm text-blue-700">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

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
            Question {questionToDelete?.question_number}:{' '}
            <strong>
              {truncateText(questionToDelete?.prompt || '', 100)}
            </strong>
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
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete Question
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
