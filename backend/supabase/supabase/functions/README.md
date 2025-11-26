# Supabase Edge Functions

This directory contains Supabase Edge Functions for the IRA IFRS 17 Exam System.

## Functions

### `start-exam`
Initializes an exam attempt for a student.

**Request:**
```json
POST /start-exam
{
  "exam_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "uuid",
      "started_at": "timestamp",
      "expires_at": "timestamp",
      "status": "in_progress"
    },
    "exam": {
      "id": "uuid",
      "title": "string",
      "duration_minutes": 60,
      "total_marks": 24,
      "instructions": "string"
    },
    "questions": [
      {
        "id": "uuid",
        "question_number": 1,
        "prompt": "string",
        "marks": 1,
        "options": [
          { "id": "uuid", "label": "A", "text": "string" }
        ]
      }
    ],
    "saved_answers": {}
  }
}
```

### `save-answer`
Auto-saves a student's answer during the exam.

**Request:**
```json
POST /save-answer
{
  "attempt_id": "uuid",
  "question_id": "uuid",
  "option_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Answer saved",
    "question_id": "uuid",
    "option_id": "uuid"
  }
}
```

### `submit-exam`
Submits the exam, calculates the score, and returns results.

**Request:**
```json
POST /submit-exam
{
  "attempt_id": "uuid",
  "answers": {
    "question_id_1": "option_id_1",
    "question_id_2": "option_id_2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "exam_title": "string",
    "total_marks": 24,
    "score": 18,
    "percentage": 75,
    "pass_mark": 15,
    "passed": true,
    "completed_at": "timestamp",
    "review": {
      "questions": [
        {
          "question_id": "uuid",
          "question_number": 1,
          "prompt": "string",
          "is_correct": true,
          "marks_earned": 1,
          "explanation": "string",
          "options": [...]
        }
      ]
    }
  }
}
```

## Deployment

### Prerequisites
1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd backend/supabase
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy start-exam
supabase functions deploy save-answer
supabase functions deploy submit-exam
```

Or deploy all at once:
```bash
supabase functions deploy
```

### Local Development

Start the local development server:
```bash
supabase functions serve
```

Test locally with curl:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/start-exam' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"exam_id":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}'
```

## Environment Variables

The functions automatically have access to:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

## Error Handling

All functions return consistent error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (not logged in)
- `405` - Method not allowed
- `500` - Internal server error
