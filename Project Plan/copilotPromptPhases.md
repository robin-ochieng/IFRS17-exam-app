# Copilot Prompt Phases

## Prompt 1 – Create the core schema migration

**File:** `backend/supabase/migrations/XXXX_create_ifrs_exam_schema.sql`

Paste this at the top and let Copilot complete:

```sql
-- You are an expert PostgreSQL and Supabase schema designer.
-- Create the core schema for an IFRS 17 exam system for IRA.
-- Use gen_random_uuid() for UUIDs, timestamptz with default now(), and
-- reasonable NOT NULL constraints. Reference auth.users for user IDs.
-- Create the following tables:
--
-- 1) profiles
--    - id uuid primary key references auth.users(id) on delete cascade
--    - full_name text not null
--    - email text not null unique
--    - organisation text
--    - role text not null check (role in ('student', 'admin', 'super_admin')) default 'student'
--    - created_at timestamptz not null default now()
--
-- 2) exams
--    - id uuid primary key default gen_random_uuid()
--    - title text not null
--    - description text
--    - is_active boolean not null default false
--    - total_marks integer not null
--    - pass_mark_percent integer not null default 60
--    - duration_minutes integer not null
--    - randomize_questions boolean not null default false
--    - created_by uuid references profiles(id)
--    - created_at timestamptz not null default now()
--
-- 3) questions
--    - id uuid primary key default gen_random_uuid()
--    - exam_id uuid not null references exams(id) on delete cascade
--    - question_number integer not null
--    - prompt text not null
--    - marks integer not null default 1
--    - explanation text
--    - is_active boolean not null default true
--    - created_at timestamptz not null default now()
--    - add a unique constraint on (exam_id, question_number)
--
-- 4) options
--    - id uuid primary key default gen_random_uuid()
--    - question_id uuid not null references questions(id) on delete cascade
--    - label text  -- e.g. "a", "b", "c"
--    - text text not null
--    - is_correct boolean not null default false
--    - created_at timestamptz not null default now()
--
-- 5) attempts
--    - id uuid primary key default gen_random_uuid()
--    - exam_id uuid not null references exams(id) on delete cascade
--    - user_id uuid not null references profiles(id) on delete cascade
--    - started_at timestamptz not null default now()
--    - submitted_at timestamptz
--    - raw_score numeric(10,2)
--    - percent_score numeric(5,2)
--    - passed boolean
--    - status text not null check (status in ('in_progress','submitted','expired')) default 'in_progress'
--    - add an index on (exam_id, user_id)
--
-- 6) attempt_answers
--    - id uuid primary key default gen_random_uuid()
--    - attempt_id uuid not null references attempts(id) on delete cascade
--    - question_id uuid not null references questions(id) on delete cascade
--    - selected_option_id uuid references options(id)
--    - is_correct boolean
--    - awarded_marks numeric(10,2)
--    - created_at timestamptz not null default now()
--    - add a unique constraint on (attempt_id, question_id)
--
-- Generate clean CREATE TABLE statements for all of the above.
```

Let Copilot generate the full SQL; skim it to confirm column names and constraints.

---

## Prompt 2 – Enable Row Level Security & base policies

In the same migration file or a new one (e.g. `XXXX_enable_rls.sql`), paste:

```sql
-- You are an expert in Supabase Row Level Security.
-- Enable RLS and create sensible default policies for these tables:
--   profiles, exams, questions, options, attempts, attempt_answers.
--
-- Rules:
-- 1) profiles:
--    - Only authenticated users can select.
--    - A user can select and update ONLY their own profile (id = auth.uid()).
--    - Admins and super_admins can select all profiles.
--
-- 2) exams, questions, options:
--    - All authenticated users (students + admins) can SELECT active exams,
--      active questions and options.
--    - Only admins/super_admins can INSERT, UPDATE, DELETE.
--
-- 3) attempts:
--    - A student can INSERT a new attempt where user_id = auth.uid().
--    - A student can SELECT only attempts where user_id = auth.uid().
--    - Only admins/super_admins can SELECT all attempts.
--
-- 4) attempt_answers:
--    - A student can INSERT or UPDATE answers only for attempts where user_id = auth.uid().
--    - A student can SELECT only their own answers through the same logic.
--    - Admins/super_admins can SELECT all.
--
-- Implement:
--   - ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
--   - create policy statements that reference auth.uid() and the role stored in profiles.role.
-- Assume that the profiles table is already populated with a row linked to auth.users for each user.
```

Copilot should generate `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and `CREATE POLICY` statements.

Double-check that it JOINs to profiles via user_id or uses EXISTS with profiles.role.

---

## Prompt 3 – Seed an initial exam & questions (IFRS 17)

Create a migration like `XXXX_seed_ifrs17_exam.sql`:

```sql
-- Seed data for an initial IFRS 17 exam for IRA.
-- 1) Insert one exam into exams:
--    - title: 'IRA IFRS 17 Online Exam'
--    - description: 'Online assessment of IFRS 17 knowledge for insurers under IRA supervision.'
--    - is_active: true
--    - duration_minutes: 60
--    - pass_mark_percent: 60
--    - total_marks: set equal to the sum of all question marks you will insert below.
--
-- 2) Insert the first 14 questions with options and explanations.
-- Use the following structure (marks in brackets):
--
-- Question 1 (1 mark):
--  Prompt: "What is global date of Initial Application of IFRS 17 for insurance companies under National Insurance Commission's supervision? When did IFRS 17 Standard start applying?"
--  Options:
--    A. 31 Dec 2023
--    B. 1 Jan 2022
--    C. 1 Jan 2023  -- correct
--    D. 31 Dec 2021
--  Explanation: "IFRS 17 is effective for annual reporting periods beginning on or after 1 January 2023, which is the global initial application date."
--
-- Question 2 (1 mark):
--  Prompt: "When the National Insurance Commission (NIC) is supervising insurers, which of the methods below does it NOT expect to see as an IFRS 17 application method?"
--  Options:
--    A. Premium Allocation Approach
--    B. General Allocation Approach -- correct
--    C. General Measurement Model
--    D. Variable Fee Approach
--  Explanation: "IFRS 17 recognises three measurement approaches: General Measurement Model (GMM), Premium Allocation Approach (PAA) and Variable Fee Approach (VFA). 'General Allocation Approach' is not an IFRS 17 method."
--
-- [Continue with Questions 3–14 in the same style, including marks, correct option, and explanation.]
--
-- For each question:
--   - Insert into questions with exam_id, question_number, prompt, marks, explanation.
--   - Then insert its four options into options, referencing question_id.
--   - Mark the correct option with is_correct = true.
--
-- Use WITH ... INSERT ... RETURNING to capture exam_id and question_ids as needed.
```

You don't have to type all questions; you can paste each prompt/options/explanation block under this and let Copilot generate the inserts.

---

## Prompt 4 – Create a view for leaderboard (optional but useful early)

New migration `XXXX_create_leaderboard_view.sql`:

```sql
-- Create a view "leaderboard" that shows the best attempt per user per exam.
-- Columns:
--   exam_id, user_id, best_percent_score, best_raw_score, attempts_count, last_submitted_at.
-- Logic:
--   - Group attempts by exam_id and user_id.
--   - best_percent_score = max(percent_score).
--   - best_raw_score = max(raw_score).
--   - attempts_count = count(*).
--   - last_submitted_at = max(submitted_at).
-- Only include attempts with status = 'submitted'.
--
-- Use CREATE VIEW leaderboard AS ...
```

This gives you something easy to query from the student dashboard later.

---

## Prompt 5 – Supabase Edge function: start_exam

Create folder/file: `backend/supabase/functions/start_exam/index.ts`

Paste this at the top:

```typescript
/**
 * You are an expert Supabase Edge Function author using Deno + TypeScript.
 * Implement a function "start_exam" that:
 *  - Requires a valid Supabase auth JWT (student).
 *  - Accepts a JSON body with { examId: string }.
 *  - Checks that the exam exists and is_active = true.
 *  - If the user already has an "in_progress" attempt for this exam, return that attempt.
 *  - Otherwise create a new attempt row:
 *      - exam_id = examId
 *      - user_id = auth user id
 *      - status = 'in_progress'
 *      - started_at = now()
 *  - Return JSON with:
 *      - attempt: the attempt row
 *      - exam: basic exam info (title, duration_minutes, total_marks)
 *      - questions: an array of questions with options,
 *        but DO NOT include is_correct flags in the response.
 *
 * Use the official Supabase JS client for Edge Functions, reading the
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment variables.
 */
```

Then let Copilot complete the function body.

You'll add this function to your Supabase config and deploy with `supabase functions deploy start_exam`.

---

## Prompt 6 – Supabase Edge function: submit_exam

**File:** `backend/supabase/functions/submit_exam/index.ts`

```typescript
/**
 * You are an expert Supabase Edge Function author using Deno + TypeScript.
 * Implement a function "submit_exam" that:
 *   - Requires a valid Supabase auth JWT.
 *   - Accepts a JSON body with { attemptId: string }.
 *   - Loads the attempt by id and checks:
 *        - It belongs to the authenticated user.
 *        - status = 'in_progress'.
 *   - For that attempt:
 *       1) Join attempt_answers with questions and options.
 *       2) For each answer:
 *          - Determine if selected_option_id is correct using options.is_correct.
 *          - Compute awarded_marks = question.marks if correct else 0.
 *          - Update attempt_answers.is_correct and awarded_marks.
 *       3) Sum awarded_marks over all answers as raw_score.
 *       4) Load the exam.total_marks and compute percent_score = (raw_score / total_marks) * 100.
 *       5) Set passed = (percent_score >= exam.pass_mark_percent).
 *       6) Update attempts:
 *            - status = 'submitted'
 *            - submitted_at = now()
 *            - raw_score, percent_score, passed.
 *   - Return JSON payload including:
 *       - attempt summary (percent_score, raw_score, passed).
 *       - questions with:
 *           - prompt
 *           - options text
 *           - correct option id
 *           - the user's selected option id
 *           - explanation
 *         so that the frontend can show a detailed review screen.
 */
```

Copilot should scaffold the logic for you; adjust queries if needed.

---

## Prompt 7 – Shared TypeScript types for frontends

**File:** `shared/types/exam.ts`:

```typescript
/**
 * You are an expert TypeScript modeller.
 * Define shared types for the IFRS 17 exam application that both the
 * frontend-user and frontend-admin apps can import.
 *
 * Create types:
 *  - Profile
 *  - Exam
 *  - Question
 *  - Option
 *  - Attempt
 *  - AttemptAnswer
 *
 * Ensure that:
 *  - UUIDs are typed as string.
 *  - Dates are string | Date (because they may come from Supabase as strings).
 *  - Option hides is_correct when used on the client, but we can add a
 *    separate AdminOption type that includes is_correct.
 */
```

This will make it easier to keep your frontends in sync with the DB.

---

## Prompt 8 – Minimal backend README

**File:** `backend/README.md`:

```markdown
<!-- You are GitHub Copilot. Write a short, professional README for the backend
     of an IFRS 17 exam application for IRA using Supabase.
     Cover:
       - Supabase project setup prerequisites.
       - How to run migrations with supabase CLI.
       - How to deploy and test the start_exam and submit_exam Edge Functions.
       - Basic environment variables required (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
       - A one-paragraph architecture overview.
-->
```
