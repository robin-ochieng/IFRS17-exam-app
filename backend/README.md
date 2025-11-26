# IRA IFRS 17 Exam - Backend

## Overview

This backend powers the IRA IFRS 17 Exam application using **Supabase** as the managed backend service. It provides:

- **PostgreSQL Database** with Row-Level Security (RLS)
- **Authentication** via Supabase Auth (magic link / OTP)
- **Edge Functions** for secure exam logic (start_exam, submit_exam)
- **Storage** for certificates and assets

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- A Supabase project created at [supabase.com](https://supabase.com)
- Node.js 18+ (for local development)

## Environment Variables

Create a `.env` file in this directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Never commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` client-side.**

## Project Structure

```
backend/
├── supabase/
│   ├── migrations/     # SQL migrations for schema changes
│   ├── seed/           # Seed data (initial exam questions)
│   └── functions/      # Edge Functions (start_exam, submit_exam)
└── README.md
```

## Running Migrations

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push

# Or apply migrations in order
supabase migration up
```

## Deploying Edge Functions

```bash
# Deploy start_exam function
supabase functions deploy start_exam

# Deploy submit_exam function
supabase functions deploy submit_exam

# Deploy all functions
supabase functions deploy
```

## Testing Edge Functions Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/start_exam \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"examId": "uuid-here"}'
```

## Database Schema

The schema includes the following tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles extending Supabase auth |
| `exams` | Exam definitions (title, duration, pass mark) |
| `questions` | Questions belonging to exams |
| `options` | Answer options for questions |
| `attempts` | Student exam attempts |
| `attempt_answers` | Individual answers per attempt |

## Row-Level Security

RLS policies ensure:

- Students can only access their own profiles, attempts, and answers
- Admins can view all data but only modify exams/questions
- Questions/options hide `is_correct` flag during active exams

## Edge Functions

### `start_exam(exam_id)`

- Validates user authentication
- Checks exam is active
- Creates new attempt or returns existing in-progress attempt
- Returns exam metadata and questions (without correct answers)

### `submit_exam(attempt_id)`

- Validates attempt belongs to user
- Scores all answers
- Computes raw_score, percent_score, passed
- Returns full review with correct answers and explanations
