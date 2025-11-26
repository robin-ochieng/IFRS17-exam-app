# IRA IFRS 17 Exam - Shared

## Overview

This package contains shared code used by both `frontend-user` and `frontend-admin` applications.

## Structure

```
shared/
├── types/          # TypeScript type definitions
│   └── index.ts    # All shared types
├── utils/          # Utility functions
│   └── index.ts    # Helper functions
├── config/         # Configuration constants
│   └── index.ts    # App-wide config
└── README.md
```

## Usage

Import from the shared package in your frontend applications:

```typescript
// In frontend-user or frontend-admin
import { Profile, Exam, Question } from '@/shared/types';
import { formatDate, calculatePercentage } from '@/shared/utils';
import { APP_CONFIG, ROUTES } from '@/shared/config';
```

## Types

### Core Types

- `Profile` - User profile data
- `Exam` - Exam definition
- `Question` / `AdminQuestion` - Question with/without correct answers
- `Option` / `AdminOption` - Answer option with/without is_correct
- `Attempt` - Student exam attempt
- `AttemptAnswer` - Individual answer

### API Types

- `StartExamResponse` - Response from start_exam Edge Function
- `SubmitExamRequest` - Request body for submit_exam
- `ExamResult` - Full result with review data
- `QuestionReview` - Question review with correct answer

### Enums

- `UserRole` - 'student' | 'admin' | 'super_admin'
- `AttemptStatus` - 'in_progress' | 'submitted' | 'expired'

## Utilities

- `formatDate()` / `formatDateTime()` - Date formatting
- `formatDuration()` / `formatCountdown()` - Time formatting
- `calculatePercentage()` - Score calculation
- `isPassing()` / `getPassStatus()` - Pass/fail helpers
- `shuffleArray()` - Question/option randomization
- `getOptionLabel()` - Generate A, B, C, D labels

## Configuration

- `APP_CONFIG` - Application metadata
- `EXAM_DEFAULTS` - Default exam settings
- `TIMER_WARNINGS` - Countdown warning thresholds
- `ROUTES` - Navigation paths
- `API_ENDPOINTS` - Edge Function URLs
