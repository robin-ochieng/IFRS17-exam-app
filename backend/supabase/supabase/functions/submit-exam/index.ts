// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
//
// This enables autocomplete, go to definition, etc.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient, createSupabaseAdminClient, getUser } from '../_shared/supabase.ts';

interface SubmitExamRequest {
  attempt_id: string;
  answers: Record<string, string>; // question_id -> option_id
}

interface QuestionResult {
  question_id: string;
  question_number: number;
  prompt: string;
  marks: number;
  selected_option_id: string | null;
  correct_option_id: string;
  is_correct: boolean;
  marks_earned: number;
  explanation: string;
  options: {
    id: string;
    label: string;
    text: string;
    is_correct: boolean;
  }[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    // Get request body
    const { attempt_id, answers }: SubmitExamRequest = await req.json();

    if (!attempt_id) {
      return errorResponse('attempt_id is required');
    }

    if (!answers || typeof answers !== 'object') {
      return errorResponse('answers object is required');
    }

    // Create Supabase client with user context
    const supabase = createSupabaseClient(req);

    // Get authenticated user
    const user = await getUser(supabase);
    if (!user) {
      return errorResponse('Unauthorized - please log in', 401);
    }

    // Get the attempt and verify it belongs to this user
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select(`
        *,
        exams (
          id,
          title,
          total_marks,
          pass_mark_percent,
          allow_review
        )
      `)
      .eq('id', attempt_id)
      .eq('student_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return errorResponse('Attempt not found or access denied');
    }

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      return errorResponse('This exam has already been submitted');
    }

    // Check if attempt has expired
    if (attempt.expires_at && new Date(attempt.expires_at) < new Date()) {
      // Auto-submit with whatever answers were saved
      console.log('Attempt expired, auto-submitting...');
    }

    // Use admin client to access correct answers (bypasses RLS)
    const adminClient = createSupabaseAdminClient();

    // Get all questions with correct answers
    const { data: questions, error: questionsError } = await adminClient
      .from('questions')
      .select(`
        id,
        question_number,
        prompt,
        marks,
        explanation,
        options (
          id,
          label,
          text,
          is_correct,
          display_order
        )
      `)
      .eq('exam_id', attempt.exam_id)
      .eq('is_active', true)
      .order('question_number');

    if (questionsError || !questions) {
      console.error('Questions error:', questionsError);
      return errorResponse('Failed to load questions for grading');
    }

    // Calculate score and build results
    let totalScore = 0;
    const questionResults: QuestionResult[] = [];
    const answerInserts: { attempt_id: string; question_id: string; selected_option_id: string; is_correct: boolean; marks_earned: number }[] = [];

    for (const question of questions) {
      const options = (question.options as any[]).sort((a, b) => a.display_order - b.display_order);
      const correctOption = options.find((o) => o.is_correct);
      const selectedOptionId = answers[question.id] || null;
      const isCorrect = selectedOptionId === correctOption?.id;
      const marksEarned = isCorrect ? question.marks : 0;

      totalScore += marksEarned;

      // Build result for this question
      questionResults.push({
        question_id: question.id,
        question_number: question.question_number,
        prompt: question.prompt,
        marks: question.marks,
        selected_option_id: selectedOptionId,
        correct_option_id: correctOption?.id,
        is_correct: isCorrect,
        marks_earned: marksEarned,
        explanation: question.explanation,
        options: options.map((o) => ({
          id: o.id,
          label: o.label,
          text: o.text,
          is_correct: o.is_correct,
        })),
      });

      // Only insert answer if user selected something
      if (selectedOptionId) {
        answerInserts.push({
          attempt_id,
          question_id: question.id,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
          marks_earned: marksEarned,
        });
      }
    }

    // Delete any existing answers for this attempt (in case of re-submit)
    await adminClient
      .from('attempt_answers')
      .delete()
      .eq('attempt_id', attempt_id);

    // Insert all answers
    if (answerInserts.length > 0) {
      const { error: insertError } = await adminClient
        .from('attempt_answers')
        .insert(answerInserts);

      if (insertError) {
        console.error('Insert answers error:', insertError);
        return errorResponse('Failed to save answers');
      }
    }

    // Calculate final results
    const exam = attempt.exams as any;
    const totalMarks = exam.total_marks;
    const passMark = Math.ceil((exam.pass_mark_percent / 100) * totalMarks);
    const passed = totalScore >= passMark;
    const percentageScore = Math.round((totalScore / totalMarks) * 100);

    // Update the attempt with final results
    const { error: updateError } = await adminClient
      .from('attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: totalScore,
        passed,
      })
      .eq('id', attempt_id);

    if (updateError) {
      console.error('Update attempt error:', updateError);
      return errorResponse('Failed to finalize exam submission');
    }

    // Build response
    const response: any = {
      success: true,
      data: {
        attempt_id,
        exam_title: exam.title,
        total_marks: totalMarks,
        score: totalScore,
        percentage: percentageScore,
        pass_mark: passMark,
        pass_mark_percent: exam.pass_mark_percent,
        passed,
        completed_at: new Date().toISOString(),
        questions_answered: answerInserts.length,
        questions_total: questions.length,
        questions_correct: questionResults.filter((q) => q.is_correct).length,
      },
    };

    // Include detailed results if review is allowed
    if (exam.allow_review) {
      response.data.review = {
        questions: questionResults,
      };
    }

    return jsonResponse(response);
  } catch (error) {
    console.error('Submit exam error:', error);
    return errorResponse('An unexpected error occurred', 500);
  }
});
