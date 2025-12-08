'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { questionFormSchema, QuestionFormData } from '@/types/forms';
import { QUESTION_DEFAULTS } from '@/lib/constants';
import {
  Button,
  Input,
  Textarea,
  Switch,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Alert,
} from '@/components/ui';
import type { Exam } from '@/types/database';

interface QuestionFormProps {
  exams: Pick<Exam, 'id' | 'title'>[];
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  defaultExamId?: string;
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionForm({
  exams,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Question',
  defaultExamId,
}: QuestionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      exam_id: initialData?.exam_id || defaultExamId || '',
      question_number: initialData?.question_number || 1,
      prompt: initialData?.prompt || '',
      marks: initialData?.marks || QUESTION_DEFAULTS.MARKS,
      explanation: initialData?.explanation || '',
      is_active: initialData?.is_active ?? QUESTION_DEFAULTS.IS_ACTIVE,
      options: initialData?.options || [
        { label: 'A', text: '', is_correct: true, display_order: 0 },
        { label: 'B', text: '', is_correct: false, display_order: 1 },
        { label: 'C', text: '', is_correct: false, display_order: 2 },
        { label: 'D', text: '', is_correct: false, display_order: 3 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const watchedOptions = watch('options');

  const handleCorrectChange = (index: number) => {
    // Set all options to incorrect, then set the selected one to correct
    watchedOptions.forEach((_, i) => {
      setValue(`options.${i}.is_correct`, i === index);
    });
  };

  const addOption = () => {
    const nextLabel = optionLabels[fields.length];
    if (nextLabel) {
      append({
        label: nextLabel,
        text: '',
        is_correct: false,
        display_order: fields.length,
      });
    }
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="space-y-6">
        {/* Question Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Exam"
                options={exams.map((exam) => ({
                  value: exam.id,
                  label: exam.title,
                }))}
                placeholder="Select an exam"
                error={errors.exam_id?.message}
                {...register('exam_id')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Question #"
                  type="number"
                  min={1}
                  error={errors.question_number?.message}
                  {...register('question_number', { valueAsNumber: true })}
                />

                <Input
                  label="Marks"
                  type="number"
                  min={1}
                  error={errors.marks?.message}
                  {...register('marks', { valueAsNumber: true })}
                />
              </div>
            </div>

            <Textarea
              label="Question Prompt"
              placeholder="Enter the question text..."
              rows={4}
              error={errors.prompt?.message}
              {...register('prompt')}
            />

            <Switch
              label="Active"
              description="Inactive questions will not appear in exams"
              {...register('is_active')}
            />
          </CardBody>
        </Card>

        {/* Answer Options */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Options</CardTitle>
          </CardHeader>
          <CardBody>
            {errors.options?.root && (
              <Alert variant="error" className="mb-4">
                {errors.options.root.message}
              </Alert>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                >
                  {/* Correct answer radio */}
                  <div className="pt-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={watchedOptions[index]?.is_correct}
                      onChange={() => handleCorrectChange(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>

                  {/* Option label */}
                  <div className="pt-2 font-semibold text-gray-700 w-8">
                    {field.label}.
                  </div>

                  {/* Option text */}
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${field.label} text...`}
                      error={errors.options?.[index]?.text?.message}
                      {...register(`options.${index}.text`)}
                    />
                  </div>

                  {/* Delete button */}
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {fields.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                leftIcon={<Plus className="h-4 w-4" />}
                className="mt-4"
              >
                Add Option
              </Button>
            )}

            <p className="text-sm text-gray-500 mt-3">
              Select the radio button next to the correct answer. Minimum 2 options required.
            </p>
          </CardBody>
        </Card>

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Explanation (Optional)</CardTitle>
          </CardHeader>
          <CardBody>
            <Textarea
              placeholder="Provide an explanation for the correct answer. This will be shown to candidates after they submit the exam (if review is enabled)."
              rows={4}
              error={errors.explanation?.message}
              {...register('explanation')}
            />
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
