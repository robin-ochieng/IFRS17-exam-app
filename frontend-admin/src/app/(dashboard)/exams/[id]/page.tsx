'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { ExamForm } from '@/components/forms';
import { LoadingSpinner } from '@/components/ui';
import type { ExamFormData } from '@/types/forms';
import type { Exam } from '@/types/database';

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) {
        toast.error('Failed to load exam');
        router.push('/exams');
        return;
      }

      setExam(data);
      setLoading(false);
    };

    fetchExam();
  }, [examId, router]);

  const handleSubmit = async (data: ExamFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const updateData = {
        title: data.title,
        description: data.description || null,
        duration_minutes: data.duration_minutes,
        total_marks: data.total_marks,
        pass_mark_percent: data.pass_mark_percent,
        max_attempts: data.max_attempts || null,
        randomize_questions: data.randomize_questions,
        allow_review: data.allow_review,
        instructions: data.instructions || null,
        is_active: data.is_active,
      };

      const { error } = await (supabase
        .from('exams') as any)
        .update(updateData)
        .eq('id', examId);

      if (error) {
        toast.error('Failed to update exam: ' + error.message);
        return;
      }

      toast.success('Exam updated successfully!');
      router.push('/exams');
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

  if (!exam) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Exams', href: '/exams' },
          { label: exam.title, href: `/exams/${examId}` },
          { label: 'Edit' },
        ]}
      />

      <PageHeader
        title="Edit Exam"
        description={`Editing: ${exam.title}`}
      />

      <ExamForm
        initialData={{
          title: exam.title,
          description: exam.description,
          duration_minutes: exam.duration_minutes,
          total_marks: exam.total_marks,
          pass_mark_percent: exam.pass_mark_percent,
          max_attempts: exam.max_attempts,
          randomize_questions: exam.randomize_questions,
          allow_review: exam.allow_review,
          instructions: exam.instructions,
          is_active: exam.is_active,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/exams')}
        isLoading={isSubmitting}
        submitLabel="Update Exam"
      />
    </div>
  );
}
