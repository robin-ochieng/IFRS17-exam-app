'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Select,
  Alert,
  Badge,
  LoadingSpinner,
} from '@/components/ui';
import type { Exam } from '@/types/database';

interface ParsedQuestion {
  row: number;
  valid: boolean;
  errors: string[];
  data: {
    question_number: number;
    prompt: string;
    marks: number;
    option_a: string;
    option_b: string;
    option_c?: string;
    option_d?: string;
    option_e?: string;
    option_f?: string;
    correct_answer: string;
    explanation?: string;
  };
}

export default function ImportQuestionsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Pick<Exam, 'id' | 'title'>[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('exams')
        .select('id, title')
        .order('title');
      setExams(data || []);
      setLoading(false);
    };
    fetchExams();
  }, []);

  const validateQuestion = (row: Record<string, string>, rowIndex: number): ParsedQuestion => {
    const errors: string[] = [];
    
    const questionNumber = parseInt(row.question_number || row['Question Number'] || row['#'] || '0');
    const prompt = row.prompt || row.Prompt || row.Question || '';
    const marks = parseInt(row.marks || row.Marks || '1');
    const optionA = row.option_a || row['Option A'] || row.A || '';
    const optionB = row.option_b || row['Option B'] || row.B || '';
    const optionC = row.option_c || row['Option C'] || row.C || '';
    const optionD = row.option_d || row['Option D'] || row.D || '';
    const optionE = row.option_e || row['Option E'] || row.E || '';
    const optionF = row.option_f || row['Option F'] || row.F || '';
    const correctAnswer = (row.correct_answer || row['Correct Answer'] || row.Answer || '').toUpperCase();
    const explanation = row.explanation || row.Explanation || '';

    if (!questionNumber || questionNumber < 1) {
      errors.push('Invalid question number');
    }
    if (!prompt || prompt.length < 10) {
      errors.push('Question prompt too short (min 10 characters)');
    }
    if (!optionA) {
      errors.push('Option A is required');
    }
    if (!optionB) {
      errors.push('Option B is required');
    }
    if (!correctAnswer || !['A', 'B', 'C', 'D', 'E', 'F'].includes(correctAnswer)) {
      errors.push('Invalid correct answer (must be A-F)');
    }

    // Validate correct answer has corresponding option
    const optionMap: Record<string, string> = { A: optionA, B: optionB, C: optionC, D: optionD, E: optionE, F: optionF };
    if (correctAnswer && !optionMap[correctAnswer]) {
      errors.push(`Option ${correctAnswer} marked as correct but is empty`);
    }

    return {
      row: rowIndex + 2, // +2 for header row and 1-based index
      valid: errors.length === 0,
      errors,
      data: {
        question_number: questionNumber,
        prompt,
        marks: marks || 1,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC || undefined,
        option_d: optionD || undefined,
        option_e: optionE || undefined,
        option_f: optionF || undefined,
        correct_answer: correctAnswer,
        explanation: explanation || undefined,
      },
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setParsedQuestions([]);
  };

  const parseFile = useCallback(() => {
    if (!file) return;

    setParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row, index) =>
          validateQuestion(row as Record<string, string>, index)
        );
        setParsedQuestions(parsed);
        setParsing(false);

        const validCount = parsed.filter((q) => q.valid).length;
        const invalidCount = parsed.filter((q) => !q.valid).length;

        if (validCount > 0) {
          toast.success(`Parsed ${validCount} valid questions`);
        }
        if (invalidCount > 0) {
          toast.warning(`${invalidCount} questions have validation errors`);
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error(error);
        setParsing(false);
      },
    });
  }, [file]);

  const handleImport = async () => {
    if (!selectedExamId) {
      toast.error('Please select an exam');
      return;
    }

    const validQuestions = parsedQuestions.filter((q) => q.valid);
    if (validQuestions.length === 0) {
      toast.error('No valid questions to import');
      return;
    }

    setImporting(true);

    try {
      const supabase = createClient();

      // Get existing question numbers for this exam
      const { data: existingQuestions } = await (supabase as any)
        .from('questions')
        .select('question_number')
        .eq('exam_id', selectedExamId);

      interface QuestionNumberRow { question_number: number }
      const existingNumbers = new Set((existingQuestions as QuestionNumberRow[] | null)?.map((q) => q.question_number) || []);

      let imported = 0;
      let skipped = 0;

      for (const q of validQuestions) {
        // Skip if question number already exists
        if (existingNumbers.has(q.data.question_number)) {
          skipped++;
          continue;
        }

        // Insert question
        const { data: question, error: questionError } = await (supabase as any)
          .from('questions')
          .insert({
            exam_id: selectedExamId,
            question_number: q.data.question_number,
            prompt: q.data.prompt,
            marks: q.data.marks,
            explanation: q.data.explanation || null,
            is_active: true,
          })
          .select()
          .single();

        if (questionError) {
          console.error('Failed to insert question:', questionError);
          continue;
        }

        // Build options array
        const options: { question_id: string; label: string; text: string; is_correct: boolean; display_order: number }[] = [];
        const optionData = [
          { label: 'A', text: q.data.option_a },
          { label: 'B', text: q.data.option_b },
          { label: 'C', text: q.data.option_c },
          { label: 'D', text: q.data.option_d },
          { label: 'E', text: q.data.option_e },
          { label: 'F', text: q.data.option_f },
        ];

        optionData.forEach((opt, index) => {
          if (opt.text) {
            options.push({
              question_id: question.id,
              label: opt.label,
              text: opt.text,
              is_correct: opt.label === q.data.correct_answer,
              display_order: index,
            });
          }
        });

        // Insert options
        const { error: optionsError } = await (supabase as any).from('options').insert(options);

        if (optionsError) {
          console.error('Failed to insert options:', optionsError);
          // Rollback question
          await (supabase as any).from('questions').delete().eq('id', question.id);
          continue;
        }

        imported++;
      }

      toast.success(`Successfully imported ${imported} questions`);
      if (skipped > 0) {
        toast.info(`${skipped} questions skipped (duplicate question numbers)`);
      }

      router.push(`/exams/${selectedExamId}/questions`);
    } catch (error) {
      toast.error('An error occurred during import');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedQuestions.filter((q) => q.valid).length;
  const invalidCount = parsedQuestions.filter((q) => !q.valid).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Questions', href: '/questions' },
          { label: 'Import' },
        ]}
      />

      <PageHeader
        title="Import Questions"
        description="Bulk import questions from a CSV file"
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Your CSV file should have the following columns:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Column</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Required</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="px-3 py-2">question_number</td><td className="px-3 py-2">Yes</td><td className="px-3 py-2">Unique question number</td></tr>
                <tr><td className="px-3 py-2">prompt</td><td className="px-3 py-2">Yes</td><td className="px-3 py-2">Question text (min 10 chars)</td></tr>
                <tr><td className="px-3 py-2">marks</td><td className="px-3 py-2">No</td><td className="px-3 py-2">Points (default: 1)</td></tr>
                <tr><td className="px-3 py-2">option_a, option_b</td><td className="px-3 py-2">Yes</td><td className="px-3 py-2">At least 2 options required</td></tr>
                <tr><td className="px-3 py-2">option_c, option_d, option_e, option_f</td><td className="px-3 py-2">No</td><td className="px-3 py-2">Additional options</td></tr>
                <tr><td className="px-3 py-2">correct_answer</td><td className="px-3 py-2">Yes</td><td className="px-3 py-2">Letter (A-F) of correct option</td></tr>
                <tr><td className="px-3 py-2">explanation</td><td className="px-3 py-2">No</td><td className="px-3 py-2">Explanation for correct answer</td></tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Target Exam"
            options={exams.map((exam) => ({
              value: exam.id,
              label: exam.title,
            }))}
            placeholder="Select an exam"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CSV File
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Choose file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParsedQuestions([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {file && parsedQuestions.length === 0 && (
            <Button onClick={parseFile} loading={parsing}>
              Parse File
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Preview */}
      {parsedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview ({parsedQuestions.length} questions)</span>
              <div className="flex items-center gap-2">
                <Badge variant="success">{validCount} valid</Badge>
                {invalidCount > 0 && (
                  <Badge variant="danger">{invalidCount} invalid</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {parsedQuestions.map((q) => (
                <div
                  key={q.row}
                  className={`p-3 rounded-lg border ${
                    q.valid
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {q.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Row {q.row}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          Q{q.data.question_number}
                        </span>
                        <Badge variant="info">{q.data.marks} marks</Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {q.data.prompt}
                      </p>
                      {!q.valid && (
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                          {q.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setParsedQuestions([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={validCount === 0 || !selectedExamId}
            >
              Import {validCount} Questions
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
