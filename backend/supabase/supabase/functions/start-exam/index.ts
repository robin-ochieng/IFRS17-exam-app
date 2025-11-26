// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
//
// This enables autocomplete, go to definition, etc.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient, getUser } from '../_shared/supabase.ts';

interface StartExamRequest {
  exam_id: string;
}

interface Question {
  id: string;
  question_number: number;
  prompt: string;
  marks: number;
  options: {
    id: string;
    label: string;
    text: string;
    display_order: number;
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
    const { exam_id }: StartExamRequest = await req.json();

    if (!exam_id) {
      return errorResponse('exam_id is required');
    }

    // Create Supabase client with user context
    const supabase = createSupabaseClient(req);

    // Get authenticated user
    const user = await getUser(supabase);
    if (!user) {
      return errorResponse('Unauthorized - please log in', 401);
    }

    // Check if user has a profile (required for exam)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('Profile not found. Please complete your profile first.');
    }

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', exam_id)
      .eq('is_active', true)
      .single();

    if (examError || !exam) {
      return errorResponse('Exam not found or is not active');
    }

    // Check if user has already reached max attempts
    const { count: attemptCount, error: countError } = await supabase
      .from('attempts')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', exam_id)
      .eq('user_id', user.id);

    if (countError) {
      return errorResponse('Failed to check attempt count');
    }

    if (exam.max_attempts && attemptCount !== null && attemptCount >= exam.max_attempts) {
      return errorResponse(`You have reached the maximum number of attempts (${exam.max_attempts}) for this exam`);
    }

    // Check if user has an in-progress attempt
    const { data: existingAttempt, error: existingError } = await supabase
      .from('attempts')
      .select('*')
      .eq('exam_id', exam_id)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (existingError) {
      return errorResponse('Failed to check existing attempts');
    }

    let attempt = existingAttempt;

    // If no in-progress attempt, create a new one
    if (!attempt) {
      const { data: newAttempt, error: createError } = await supabase
        .from('attempts')
        .insert({
          exam_id,
          user_id: user.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (createError || !newAttempt) {
        console.error('Create attempt error:', createError);
        return errorResponse('Failed to start exam attempt');
      }

      attempt = newAttempt;
    }

    // Get questions for the exam (using the student_options view that hides is_correct)
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_number,
        prompt,
        marks,
        student_options!inner (
          id,
          label,
          text,
          display_order
        )
      `)
      .eq('exam_id', exam_id)
      .eq('is_active', true)
      .order('question_number');

    if (questionsError) {
      console.error('Questions error:', questionsError);
      return errorResponse('Failed to load exam questions');
    }

    // Format questions for response
    const formattedQuestions: Question[] = questions.map((q) => ({
      id: q.id,
      question_number: q.question_number,
      prompt: q.prompt,
      marks: q.marks,
      options: (q.student_options as any[]).sort((a, b) => a.display_order - b.display_order).map((o) => ({
        id: o.id,
        label: o.label,
        text: o.text,
        display_order: o.display_order,
      })),
    }));

    // Optionally shuffle questions if exam requires it
    if (exam.randomize_questions) {
      formattedQuestions.sort(() => Math.random() - 0.5);
    }

    // Get any existing answers for this attempt
    const { data: existingAnswers, error: answersError } = await supabase
      .from('attempt_answers')
      .select('question_id, selected_option_id')
      .eq('attempt_id', attempt.id);

    if (answersError) {
      console.error('Answers error:', answersError);
    }

    // Build answer map
    const answerMap: Record<string, string> = {};
    if (existingAnswers) {
      existingAnswers.forEach((a) => {
        answerMap[a.question_id] = a.selected_option_id;
      });
    }

    return jsonResponse({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          started_at: attempt.started_at,
          expires_at: attempt.expires_at,
          status: attempt.status,
        },
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration_minutes: exam.duration_minutes,
          total_marks: exam.total_marks,
          pass_mark_percent: exam.pass_mark_percent,
          allow_review: exam.allow_review,
          instructions: exam.instructions,
        },
        questions: formattedQuestions,
        saved_answers: answerMap,
      },
    });
  } catch (error) {
    console.error('Start exam error:', error);
    return errorResponse('An unexpected error occurred', 500);
  }
});
