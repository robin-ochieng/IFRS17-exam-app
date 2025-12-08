'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { QuestionForm } from '@/components/forms';
import { LoadingSpinner } from '@/components/ui';
import type { QuestionFormData } from '@/types/forms';
import type { Exam, QuestionWithOptions } from '@/types/database';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<QuestionWithOptions | null>(null);
  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch exams
      const { data: examsData } = await supabase
        .from('exams')
        .select('id, title')
        .order('title');

      setExams(examsData || []);

      // Fetch question with options
      const { data, error } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('id', questionId)
        .single();

      if (error) {
        toast.error('Failed to load question');
        router.push('/questions');
        return;
      }

      setQuestion(data as QuestionWithOptions);
      setLoading(false);
    };

    fetchData();
  }, [questionId, router]);

  const handleSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update question
      const { error: questionError } = await (supabase as any)
        .from('questions')
        .update({
          exam_id: data.exam_id,
          question_number: data.question_number,
          prompt: data.prompt,
          marks: data.marks,
          explanation: data.explanation || null,
          is_active: data.is_active,
        })
        .eq('id', questionId);

      if (questionError) {
        toast.error('Failed to update question: ' + questionError.message);
        return;
      }

      // Delete existing options and recreate
      await (supabase as any).from('options').delete().eq('question_id', questionId);

      // Create new options
      const optionsToInsert = data.options.map((option, index) => ({
        question_id: questionId,
        label: option.label,
        text: option.text,
        is_correct: option.is_correct,
        display_order: index,
      }));

      const { error: optionsError } = await (supabase as any)
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        toast.error('Failed to update options: ' + optionsError.message);
        return;
      }

      toast.success('Question updated successfully!');
      router.push('/questions');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Questions', href: '/questions' },
          { label: `Q${question.question_number}` },
        ]}
      />

      <PageHeader
        title="Edit Question"
        description={`Editing Question #${question.question_number}`}
      />

      <QuestionForm
        exams={exams}
        initialData={{
          exam_id: question.exam_id,
          question_number: question.question_number,
          prompt: question.prompt,
          marks: question.marks,
          explanation: question.explanation,
          is_active: question.is_active,
          options: question.options
            ?.sort((a, b) => a.display_order - b.display_order)
            .map((opt) => ({
              id: opt.id,
              label: opt.label,
              text: opt.text,
              is_correct: opt.is_correct,
              display_order: opt.display_order,
            })),
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/questions')}
        isLoading={isSubmitting}
        submitLabel="Update Question"
      />
    </div>
  );
}
