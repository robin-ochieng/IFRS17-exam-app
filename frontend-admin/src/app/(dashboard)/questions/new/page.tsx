'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { QuestionForm } from '@/components/forms';
import { LoadingSpinner } from '@/components/ui';
import type { QuestionFormData } from '@/types/forms';
import type { Exam } from '@/types/database';

function NewQuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultExamId = searchParams.get('exam_id') || undefined;

  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextQuestionNumber, setNextQuestionNumber] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch exams
      const { data: examsData } = await (supabase as any)
        .from('exams')
        .select('id, title')
        .order('title');

      setExams(examsData || []);

      // Get next question number for default exam
      if (defaultExamId) {
        const { data: questions } = await (supabase as any)
          .from('questions')
          .select('question_number')
          .eq('exam_id', defaultExamId)
          .order('question_number', { ascending: false })
          .limit(1);

        interface QuestionRow { question_number: number }
        if (questions && questions.length > 0) {
          setNextQuestionNumber((questions as QuestionRow[])[0].question_number + 1);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [defaultExamId]);

  const handleSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Create question
      const { data: question, error: questionError } = await (supabase as any)
        .from('questions')
        .insert({
          exam_id: data.exam_id,
          question_number: data.question_number,
          prompt: data.prompt,
          marks: data.marks,
          explanation: data.explanation || null,
          is_active: data.is_active,
        })
        .select()
        .single();

      if (questionError) {
        toast.error('Failed to create question: ' + questionError.message);
        return;
      }

      // Create options
      const optionsToInsert = data.options.map((option, index) => ({
        question_id: question.id,
        label: option.label,
        text: option.text,
        is_correct: option.is_correct,
        display_order: index,
      }));

      const { error: optionsError } = await (supabase as any)
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        // Rollback question creation
        await (supabase as any).from('questions').delete().eq('id', question.id);
        toast.error('Failed to create options: ' + optionsError.message);
        return;
      }

      toast.success('Question created successfully!');
      
      // Redirect back to exam questions if came from there
      if (defaultExamId) {
        router.push(`/exams/${defaultExamId}/questions`);
      } else {
        router.push('/questions');
      }
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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Questions', href: '/questions' },
          { label: 'Create New' },
        ]}
      />

      <PageHeader
        title="Create New Question"
        description="Add a new question to the question bank"
      />

      <QuestionForm
        exams={exams}
        initialData={{
          exam_id: defaultExamId,
          question_number: nextQuestionNumber,
        }}
        defaultExamId={defaultExamId}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (defaultExamId) {
            router.push(`/exams/${defaultExamId}/questions`);
          } else {
            router.push('/questions');
          }
        }}
        isLoading={isSubmitting}
        submitLabel="Create Question"
      />
    </div>
  );
}

export default function NewQuestionPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NewQuestionContent />
    </Suspense>
  );
}
