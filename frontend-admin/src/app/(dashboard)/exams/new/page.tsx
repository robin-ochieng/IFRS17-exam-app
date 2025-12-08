'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import { ExamForm } from '@/components/forms';
import type { ExamFormData } from '@/types/forms';

export default function NewExamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ExamFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const insertData = {
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

      const { data: exam, error } = await (supabase
        .from('exams') as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        toast.error('Failed to create exam: ' + error.message);
        return;
      }

      toast.success('Exam created successfully!');
      router.push(`/exams/${exam.id}/questions`);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Exams', href: '/exams' },
          { label: 'Create New' },
        ]}
      />

      <PageHeader
        title="Create New Exam"
        description="Set up a new examination for your candidates"
      />

      <ExamForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/exams')}
        isLoading={isLoading}
        submitLabel="Create Exam"
      />
    </div>
  );
}
