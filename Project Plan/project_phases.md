# Project Phases

## Phase 1 – Discovery, Requirements & UX Concept

### Objectives

Align with IRA on objectives, rules, and user journeys before any heavy build.

### Key activities

- Exam score always expressed as 0–100%.
- Pass threshold (e.g. 60%).
- Confirm content rules:
  - MCQs only for now, single correct answer.
  - Each question must have: text, options, correct answer, explanation.
- Define user roles:
  - Student (exam taker)
  - Admin (exam & question management, reports)
- UX & flow sketches:
  - Student flow: Login → Dashboard → Start Exam → Answer → Submit → Results + Explanations.
  - Admin flow: Login → Manage Exams → Manage Questions → View Results → Export/Download.

### Deliverables

- Requirements summary (PDF/Notion).
- Low-fidelity wireframes for:
  - Student dashboard & exam screen.
  - Admin dashboard, question editor, results view.
- Finalised exam rules and pass policy.

---

## Phase 2 – Architecture, Supabase Setup & Data Model

### Objectives

Set up infrastructure and database to support all future phases.

### Key activities

**Monorepo structure:**

```
ira-ifrs17-exam/
  backend/
  frontend-user/
  frontend-admin/
  shared/
```

**Supabase project setup:**

- Enable email auth.
- Configure storage buckets if needed (logos, certificate templates).

**Implement database schema:**

```
profiles, exams, questions, options,
attempts, attempt_answers, and optional leaderboard view.
```

**Implement Row-Level Security (RLS):**

- Students can only see their own profile, attempts, and answers.
- Admins can see all attempts and questions.

**Seed initial IFRS 17 exam:**

Insert current 14 questions with:
- options
- is_correct flags
- explanations
- marks (1 or 2)

**Create Supabase Edge/RPC functions:**

- `start_exam(exam_id)`
- `submit_exam(attempt_id)` (compute score, percent, pass/fail)

### Deliverables

- Supabase project with full schema + RLS.
- Initial exam data loaded (questions, answers, explanations).
- Technical architecture diagram (frontends ↔ Supabase).

---

## Phase 3 – Student Frontend (MVP Exam Experience)

### Objectives

Deliver a working end-to-end student experience for one exam.

### Key activities

**Setup Next.js + TypeScript in frontend-user:**

- Shared UI components (buttons, cards, layout, toasts).
- Supabase client integration.

**Implement pages:**

#### Auth & onboarding

- Email login (magic link/OTP).
- Profile completion (name, organisation).

#### Dashboard

- List active exams from exams.
- Show status: Not started / In progress / Completed.

#### Exam screen

- Fetch exam via `start_exam`.
- Show one question per page:
  - Question text, options as radio buttons.
  - Next / Previous navigation.
  - Progress bar ("Question X of N").
  - Timer (countdown from duration_minutes), with auto-submit on expiry.
- Auto-save answers to attempt_answers on selection.

#### Submit flow

- Confirmation modal.
- Call `submit_exam` to:
  - Lock attempt.
  - Compute raw_score and percent_score.

#### Basic Result page

- Show exam title, score (e.g. 78/100 → 78%), pass/fail.

### Deliverables

Student site where a user can:
- Log in.
- Start an exam.
- Answer all questions.
- Submit and see their score out of 100%.

---

## Phase 4 – Explanations, Review Mode, Leaderboard & Certificates

### Objectives

Enhance learning value and gamification, while still focused on IRA's exam objectives.

### Key activities

**Detailed review page:**

For a submitted attempt, show each question with:
- Student's chosen option (highlighted).
- Correct answer (distinct colour/icon).
- Explanation from questions.explanation.
- Marks gained vs possible marks.

**Scoring logic & UI:**

- Confirm handling of multi-mark questions.
- Ensure percent_score always aligns with exams.total_marks.

**Leaderboard (optional / if IRA approves):**

- Create a view of best attempts per user.
- Student dashboard card: Top 10 scores (anonymised or not per IRA's policy).

**Certificates (optional but very likely for IRA):**

- Rule: Award certificate if percent_score >= pass_mark_percent.
- Implementation options:
  - Generate PDF server-side (Edge function) using a template.
  - Store PDF in Supabase Storage.
  - Student can download certificate from Results page.

**Email notifications (optional):**

- Send email with score and link to download certificate.

### Deliverables

- Review experience with correct answers & explanations.
- (Optional) Leaderboard section on dashboard.
- (Optional) Downloadable certificate for passed candidates.

---

## Phase 5 – Admin Frontend & Question Management

### Objectives

Give IRA and authorised staff full control over exams, questions, and results.

### Key activities

**Setup Next.js + TS in frontend-admin:**

- Shared layout with sidebar navigation.

**Implement admin pages:**

#### Exam Management

- List exams (title, active, duration, pass mark).
- Create & edit exams.
- Set is_active, duration_minutes, pass_mark_percent.

#### Question Bank

- Table of questions per exam:
  - Question text, marks, active flag.
- CRUD interfaces:
  - Add/edit question & explanation.
  - Add/edit options and mark correct one.
  - Reorder questions via drag-and-drop (update question_number).
  - Bulk import (CSV/JSON/Markdown).

#### Results & Analytics

- List of attempts with filters:
  - Exam, organisation, date range, pass/fail.
- Detail view per attempt:
  - Score, answers, time taken.
- Export to CSV/Excel for IRA reporting.

#### User & Role Management

- View profiles.
- Change role (e.g., promote admin).
- (Optional) Bulk invite via email list.
- Enforce RLS in admin UI (backed by row-level security + role checks).

### Deliverables

Admin dashboard where IRA can:
- Manage exams & questions end-to-end.
- View/export all results.
- Control who has admin access.

---

## Phase 6 – QA, Security, Compliance & Deployment

### Objectives

Ensure reliability, compliance, and a smooth launch for IRA.

### Key activities

**Functional testing:**

- Multiple exam runs across browsers and devices.
- Edge cases: network loss mid-exam, timer expiry, double submission.

**Security review:**

- Confirm RLS policies and access control.
- Validate Supabase service role keys usage only server-side.
- Rate limits for auth endpoints and any public APIs.

**Performance checks:**

- Simulate concurrent users starting/submitting exams.

**Compliance & auditability:**

- Ensure key logs (attempt creation/submission, admin edits to questions).
- Agree data retention policies with IRA.

**Deployment:**

- Host frontends on Vercel or similar.
- Supabase as managed backend.
- Setup environment variables, secrets, and backups.

**Documentation & training:**

- Short admin manual (PDF / Notion).
- Quick video or live session showing IRA how to:
  - Add questions.
  - Activate a new exam.
  - Monitor results and export.

### Deliverables

Production deployment of:
- Student exam site.
- Admin dashboard.
- Documentation, handover, and training session for IRA staff.
