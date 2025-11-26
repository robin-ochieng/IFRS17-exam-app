# IFRS 17 Exam App - Project Plan

## 1. High-level goals

- Host IFRS-17 exams for IRA and industry participants.
- Students log in, sit an exam once, and get:
  - Score (0–100%)
  - Pass/Fail
  - Detailed review with correct answers + explanations.
- Admins manage:
  - Question bank & exams
  - Candidates and attempts
  - Analytics, exports, certificates.

---

## 2. Monorepo + Folder Structure

```
ira-ifrs17-exam/
  backend/
    supabase/
      migrations/
      seed/
      functions/          # Edge functions / RPCs for exam logic
    README.md

  frontend-user/          # Student-facing exam site
    app/ or pages/
    components/
    lib/
    types/
    ...

  frontend-admin/         # Admin dashboard
    app/ or pages/
    components/
    lib/
    types/
    ...

  shared/
    types/
    utils/
    config/
```

- **Supabase:** Auth, Postgres DB, Row-Level Security, Storage, Edge Functions.
- Both frontends talk to Supabase (client SDK + a few Edge functions for sensitive operations like scoring).

---

## 3. Data Model (Supabase)

### 3.1 Core tables

#### profiles (extends Supabase auth users)

| Column | Type |
|--------|------|
| id | uuid, pk, references auth.users |
| full_name | text |
| email | text |
| organisation | text |
| role | enum('student','admin','super_admin') |
| created_at | timestamptz |

#### exams

| Column | Type |
|--------|------|
| id | uuid pk |
| title | text (e.g. "IRA IFRS17 Core Exam – 2025") |
| description | text |
| is_active | boolean |
| total_marks | int (e.g. 100) |
| pass_mark_percent | int (e.g. 60) |
| duration_minutes | int |
| randomize_questions | boolean |
| created_by | uuid → profiles.id |
| created_at | timestamptz |

#### questions

| Column | Type |
|--------|------|
| id | uuid pk |
| exam_id | uuid → exams.id |
| question_number | int (for ordering) |
| prompt | text |
| marks | int |
| explanation | text (shown after grading) |
| created_at | timestamptz |
| is_active | boolean |

#### options

| Column | Type |
|--------|------|
| id | uuid pk |
| question_id | uuid → questions.id |
| label | text # "a.", "b." optional |
| text | text # the option text |
| is_correct | boolean # only one TRUE for now |
| created_at | timestamptz |

#### attempts

| Column | Type |
|--------|------|
| id | uuid pk |
| exam_id | uuid → exams.id |
| user_id | uuid → profiles.id |
| started_at | timestamptz |
| submitted_at | timestamptz |
| raw_score | numeric # sum of marks for correct questions |
| percent_score | numeric # (raw_score / exam.total_marks) * 100 |
| passed | boolean # percent_score >= pass_mark_percent |
| status | enum('in_progress','submitted','expired') |

#### attempt_answers

| Column | Type |
|--------|------|
| id | uuid pk |
| attempt_id | uuid → attempts.id |
| question_id | uuid → questions.id |
| selected_option_id | uuid → options.id |
| is_correct | boolean (snapshot at submit time) |
| awarded_marks | numeric |

#### leaderboard (optional or view)

Could be a materialized view over attempts with best scores per user/exam.

---

## 4. Exam Logic & Scoring

- Each question has `marks` (1, 2, etc.).
- `exams.total_marks` = sum of marks of all active questions (or set explicitly).
- After submit:

```
raw_score = sum(awarded_marks)
percent_score = (raw_score / exams.total_marks) * 100
passed = percent_score >= pass_mark_percent
```

- Frontend shows 0–100%, so the exam naturally "leads to 100%".

---

## 5. User Frontend (Student Site)

### Pages (Next.js, /frontend-user):

#### Landing Page

- Branding: IRA + partners logos.
- Brief about IFRS 17 exam.
- "Log in to start exam" button.

#### Auth

- Supabase magic link / OTP (email-based).
- First login forces profile completion (name, organisation, country).

#### Dashboard

- Card for each active exam:
  - Title, duration, number of questions, status: Not started / In progress / Completed.
  - Start button disabled if already submitted (one attempt policy).

#### Exam Page

- Full-screen layout with:
  - Progress bar (question X of N).
  - Timer (countdown from duration_minutes).
  - Question prompt + MCQ options (radio buttons).
  - "Previous", "Next", "Flag for review".
  - Auto-save every time an answer is selected (writes into attempt_answers).
- On "Submit Exam":
  - Confirm dialog.
  - Call Edge function `/submit_exam` to:
    - Lock attempt, compute score, write results.

#### Results Page (Review Mode)

- Shows:
  - Percent score, raw score / total.
  - Pass/Fail with colour coding.
  - For each question:
    - Question text
    - Student's answer (highlighted)
    - Correct answer
    - Explanation (from questions.explanation)
  - If needed, button to download certificate (later feature).

---

## 6. Admin Frontend

### Pages (Next.js, /frontend-admin):

#### Admin Login

- Same Supabase auth, but RLS + UI only allows `role in ('admin','super_admin')`.

#### Exam Management

- Create/edit exams:
  - Title, description, duration, pass_mark_percent, is_active.
  - Configure question order & randomization.

#### Question Bank

- Table view: question text, marks, active flag.
- CRUD for questions + options.
- Bulk import from CSV/JSON/Markdown.
- Preview question as student would see it.

#### Results & Analytics

- List of attempts: user, organisation, score%, pass/fail, timestamps.
- Filters by exam, date, organisation.
- Export CSV/Excel.

#### User Management

- View profiles, roles.
- Invite admins, reset roles.

---

## 7. Backend / Supabase Edge Functions

### Edge functions / RPCs (in /backend/supabase/functions):

#### start_exam(exam_id)

- Checks:
  - User is authenticated & role='student'.
  - Exam active and not already submitted by this user.
- Creates attempt with status='in_progress', started_at.
- Returns exam metadata + list of questions & options (without is_correct flags).

#### submit_exam(attempt_id)

- Validates that attempt belongs to user and is in_progress.
- For each attempt_answers row:
  - Join to options to check is_correct.
  - Award marks = question.marks if correct else 0.
- Sum marks and compute %.
- Update attempt to submitted.
- Returns summary + full review payload (correct answers + explanations).

#### (Optional) get_results(attempt_id)

- For review page, returns:
  - Questions, options, selected answer, is_correct, explanation.

RLS policies ensure students can only access their own attempts and answers.

---

## 8. Seed Data: Current 14 Questions (with Answers & Explanations)

You can use this as initial seed in Supabase (e.g. convert to JSON/CSV).

> Note: numbering starts at 1 now.

### Question 1 (1 mark)

**What is global date of Initial Application of IFRS 17 for insurance companies under National Insurance Commission's supervision? When did IFRS 17 Standard start applying?**

- A. 31 Dec 2023
- B. 1 Jan 2022
- C. 1 Jan 2023 ✅
- D. 31 Dec 2021

**Correct answer:** C  
**Explanation:** IFRS 17 is effective for annual reporting periods beginning on or after 1 January 2023, which is the global initial application date.

---

### Question 2 (1 mark)

**When the National Insurance Commission (NIC) is supervising insurers, which of the methods below does it NOT expect to see as an IFRS 17 application method?**

- A. Premium Allocation Approach
- B. General Allocation Approach ✅
- C. General Measurement Model
- D. Variable Fee Approach

**Correct answer:** B  
**Explanation:** IFRS 17 recognises three measurement approaches: General Measurement Model (GMM), Premium Allocation Approach (PAA) and Variable Fee Approach (VFA). "General Allocation Approach" is not an IFRS 17 method.

---

### Question 3 (1 mark)

**Which Balance Sheet entry item below is NOT expected to be shown by an insurer while implementing IFRS 17?**

- A. Insurance Contract Liabilities
- B. Premium Receivables from Policyholders ✅
- C. Reinsurance Contract Assets
- D. Insurance Contract Assets

**Correct answer:** B  
**Explanation:** Under IFRS 17, many cash flows that used to appear as "premium receivables" are incorporated into the measurement of the insurance contract asset or liability, rather than shown as a separate "Premium Receivables from Policyholders" line.

---

### Question 4 (1 mark)

**Which Profit & Loss entry item below is NOT expected to be shown by an insurer while implementing IFRS 17?**

- A. Gross Written Premium ✅
- B. Management Expenses
- C. Commissions (Insurance Acquisition Costs)
- D. Incurred Claims

**Correct answer:** A  
**Explanation:** IFRS 17 replaces "Gross Written Premium" with "Insurance Revenue". Expenses such as management expenses, acquisition costs and incurred claims continue to be recognised as part of insurance service expenses.

---

### Question 5 (2 marks)

**IFRS 17 requires that the insurer establishes a new reserve called Contractual Service Margin ("CSM"). What does this reserve represent?**

- A. Unpaid Claims
- B. Unearned Profit ✅
- C. Earned Premium
- D. Risk Adjustment

**Correct answer:** B  
**Explanation:** The CSM represents the unearned profit the insurer will recognise as it provides insurance coverage and services in future periods.

---

### Question 6 (2 marks)

**The Risk Adjustment margin for non-financial risks can be considered as**

- A. Part of Gross Written Premium
- B. Part of Shareholder Funds
- C. Part of Premium & Claims Reserves ✅
- D. Part of Intangible Assets

**Correct answer:** C  
**Explanation:** The risk adjustment is part of the measurement of insurance contract liabilities, often viewed as part of premium and claims reserves reflecting compensation for non-financial risk.

---

### Question 7 (2 marks)

**The Liability for Incurred Claims (LIC) is composed of**

- A. Liability for Remaining Coverage & Risk Adjustment Margin
- B. Outstanding Claim Reserves and Incurred But Not Reported Reserves & Risk Adjustment for Non-Financial Risks ✅
- C. Contractual Service Margin & Risk Adjustment Margin for Non-Financial Risks
- D. Premium & Risk Adjustment Margin for Non-Financial Risks

**Correct answer:** B  
**Explanation:** LIC includes the present value of expected cash flows for incurred claims (reported and IBNR) plus the risk adjustment for non-financial risk associated with those cash flows.

---

### Question 8 (2 marks)

**How does IFRS 17 Standard expect the insurer and the National Insurance Commission to monitor how the discounting of cashflows is being unwound as the payment date gets closer?**

- A. Through Contractual Service Margin
- B. Through Insurance Finance Expense ✅
- C. Through Risk Adjustment Margin for Non-Financial Risks
- D. Through Shareholder Funds

**Correct answer:** B  
**Explanation:** The unwinding of discounting and the impact of financial risks are presented in Insurance Finance Income or Expense under IFRS 17.

---

### Question 9 (2 marks)

**If all the policyholders fully pay their premium on time, the "Insurance Revenue" of a General Insurance Company can be compared to**

- A. Gross Written Premium
- B. Gross Earned Premium ✅
- C. Net Earned Premium
- D. New Written Premium

**Correct answer:** B  
**Explanation:** When premiums are fully paid on time, the pattern of insurance revenue under IFRS 17 is broadly comparable to gross earned premium for the period.

---

### Question 10 (2 marks)

**IFRS17 has a new view on how reinsurance contracts should be treated. The spirit of the new approach is**

- A. Combine all reinsurance cashflows and policyholder cashflows to get a net position.
- B. Separate all reinsurance cashflows from policyholder cashflows and report the net cost of reinsurance separately. ✅
- C. Combine only premium reinsurance cashflows and policyholder cashflows and separate claims cashflows.
- D. Combine only claims reinsurance cashflows and policyholder cashflows and separate premium cashflows.

**Correct answer:** B  
**Explanation:** IFRS 17 requires reinsurance contracts held to be accounted for separately from underlying contracts, highlighting the cost and effect of reinsurance rather than netting everything together.

---

### Question 11 (2 marks)

**IFRS 17 has made some changes to how claim reserves should be treated when it comes to time value of money. The spirit of the new approach is**

- A. The insurer has the choice of discounting or not regardless of when the claim is expected to be paid
- B. All claims expected to be paid after a year should be discounted and those expected to be paid in less than one year should also be discounted.
- C. All claims expected to be paid after a year should be discounted and those expected to be paid in less than one year can be discounted or not depending on the choice of the insurer. ✅
- D. All claims must be discounted regardless of expected payment date.

**Correct answer:** C  
**Explanation:** IFRS 17 requires discounting where the time value of money is significant (typically long-tail claims). For shorter-duration claims where the time value is not significant, discounting may not be required.

---

### Question 12 (2 marks)

**Some people say adoption of IFRS 17 should be encouraged by regulators, such as National Insurance Commission (NIC), because it encourages CASH and CARRY by**

- A. Not considering Premium Receivables in the Balance Sheet
- B. Ignoring Uncollected Premium in Income ✅
- C. It considers premium only if claims have been paid
- D. It discounts claims

**Correct answer:** B  
**Explanation:** IFRS 17 focuses revenue recognition on services provided and cash flows actually expected to be collected, reducing recognition of income from uncollected premiums—hence the "cash and carry" notion.

---

### Question 13 (2 marks)

**When an insurer discounts its liabilities at a higher rate than what it is expecting to earn, the National Insurance Commission (NIC) can easily detect this in the Profit & Loss Account by looking at**

- A. Insurance Revenue
- B. Insurance Service Expenses
- C. Net Financial Results ✅
- D. Insurance Service Results

**Correct answer:** C  
**Explanation:** A mismatch between discount rates applied to liabilities and the actual investment return will show up in the net financial result (combining finance income on assets and finance expense on insurance liabilities).

---

### Question 14 (2 marks)

**Under the General Measurement Model (GMM), the insurance contract liabilities or assets are composed of**

- A. Liability for Remaining Coverage & Risk Adjustment Margin
- B. Liability for Remaining Coverage & Liability for Incurred Claims ✅
- C. Contractual Service Margin & Liability for Incurred Claims
- D. Premium, Outstanding Claim Reserves and Incurred But Not Reported Reserves

**Correct answer:** B  
**Explanation:** Under IFRS 17's GMM, the net position for insurance contracts is split between Liability for Remaining Coverage (LRC) and Liability for Incurred Claims (LIC), which together may form a net liability or asset.
