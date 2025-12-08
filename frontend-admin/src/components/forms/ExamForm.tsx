'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examFormSchema, ExamFormData } from '@/types/forms';
import { EXAM_DEFAULTS } from '@/lib/constants';
import {
  Button,
  Input,
  Textarea,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
} from '@/components/ui';

interface ExamFormProps {
  initialData?: Partial<ExamFormData>;
  onSubmit: (data: ExamFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ExamForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Exam',
}: ExamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      duration_minutes: initialData?.duration_minutes || EXAM_DEFAULTS.DURATION_MINUTES,
      total_marks: initialData?.total_marks || EXAM_DEFAULTS.TOTAL_MARKS,
      pass_mark_percent: initialData?.pass_mark_percent || EXAM_DEFAULTS.PASS_MARK_PERCENT,
      max_attempts: initialData?.max_attempts || null,
      randomize_questions: initialData?.randomize_questions ?? EXAM_DEFAULTS.RANDOMIZE_QUESTIONS,
      allow_review: initialData?.allow_review ?? EXAM_DEFAULTS.ALLOW_REVIEW,
      instructions: initialData?.instructions || '',
      is_active: initialData?.is_active ?? EXAM_DEFAULTS.IS_ACTIVE,
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Exam Title"
              placeholder="e.g., IFRS 17 Fundamentals Assessment"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description"
              placeholder="Brief description of the exam..."
              error={errors.description?.message}
              {...register('description')}
              rows={3}
            />

            <Textarea
              label="Instructions"
              placeholder="Instructions that will be shown to candidates before starting the exam..."
              helperText="Markdown formatting is supported"
              error={errors.instructions?.message}
              {...register('instructions')}
              rows={5}
            />
          </CardBody>
        </Card>

        {/* Exam Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Settings</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                min={1}
                max={480}
                error={errors.duration_minutes?.message}
                {...register('duration_minutes', { valueAsNumber: true })}
              />

              <Input
                label="Total Marks"
                type="number"
                min={1}
                error={errors.total_marks?.message}
                {...register('total_marks', { valueAsNumber: true })}
              />

              <Input
                label="Pass Mark (%)"
                type="number"
                min={0}
                max={100}
                error={errors.pass_mark_percent?.message}
                {...register('pass_mark_percent', { valueAsNumber: true })}
              />

              <Input
                label="Max Attempts"
                type="number"
                min={1}
                placeholder="Unlimited"
                helperText="Leave empty for unlimited attempts"
                error={errors.max_attempts?.message}
                {...register('max_attempts', {
                  setValueAs: (v) => (v === '' ? null : parseInt(v, 10)),
                })}
              />
            </div>
          </CardBody>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Switch
              label="Randomize Questions"
              description="Shuffle the order of questions for each attempt"
              {...register('randomize_questions')}
            />

            <Switch
              label="Allow Review"
              description="Allow candidates to review their answers after submission"
              {...register('allow_review')}
            />

            <div className="pt-4 border-t border-gray-200">
              <Switch
                label="Active"
                description={
                  isActive
                    ? 'Exam is active and available for candidates'
                    : 'Exam is inactive and not visible to candidates'
                }
                {...register('is_active')}
              />
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <Card>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {submitLabel}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
