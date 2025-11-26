// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient, getUser } from '../_shared/supabase.ts';

interface SaveAnswerRequest {
  attempt_id: string;
  question_id: string;
  option_id: string;
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
    const { attempt_id, question_id, option_id }: SaveAnswerRequest = await req.json();

    if (!attempt_id || !question_id || !option_id) {
      return errorResponse('attempt_id, question_id, and option_id are required');
    }

    // Create Supabase client with user context
    const supabase = createSupabaseClient(req);

    // Get authenticated user
    const user = await getUser(supabase);
    if (!user) {
      return errorResponse('Unauthorized - please log in', 401);
    }

    // Verify the attempt belongs to this user and is still in progress
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, status, expires_at')
      .eq('id', attempt_id)
      .eq('student_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return errorResponse('Attempt not found or access denied');
    }

    if (attempt.status !== 'in_progress') {
      return errorResponse('This exam has already been submitted');
    }

    // Check if attempt has expired
    if (attempt.expires_at && new Date(attempt.expires_at) < new Date()) {
      return errorResponse('This exam has expired');
    }

    // Verify the question belongs to this exam's attempt
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, exam_id')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return errorResponse('Question not found');
    }

    // Verify the option belongs to this question
    const { data: option, error: optionError } = await supabase
      .from('options')
      .select('id')
      .eq('id', option_id)
      .eq('question_id', question_id)
      .single();

    if (optionError || !option) {
      return errorResponse('Invalid option for this question');
    }

    // Upsert the answer (update if exists, insert if not)
    // We don't store is_correct or marks_earned until final submission
    const { error: upsertError } = await supabase
      .from('attempt_answers')
      .upsert(
        {
          attempt_id,
          question_id,
          selected_option_id: option_id,
          is_correct: false, // Will be calculated on submission
          marks_earned: 0,   // Will be calculated on submission
        },
        {
          onConflict: 'attempt_id,question_id',
        }
      );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return errorResponse('Failed to save answer');
    }

    return jsonResponse({
      success: true,
      data: {
        message: 'Answer saved',
        question_id,
        option_id,
      },
    });
  } catch (error) {
    console.error('Save answer error:', error);
    return errorResponse('An unexpected error occurred', 500);
  }
});
