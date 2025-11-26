-- ============================================================================
-- IRA IFRS 17 Exam System - Seed Data
-- ============================================================================
-- This migration seeds the initial IFRS 17 exam with 14 questions.
-- Total marks: 24 (4 questions × 1 mark + 10 questions × 2 marks)
-- ============================================================================

-- ============================================================================
-- 1. CREATE THE EXAM
-- ============================================================================

INSERT INTO public.exams (
    id,
    title,
    description,
    is_active,
    total_marks,
    pass_mark_percent,
    duration_minutes,
    randomize_questions,
    allow_review,
    max_attempts,
    instructions
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'IRA IFRS 17 Online Exam',
    'Online assessment of IFRS 17 knowledge for insurers under Insurance Regulatory Authority (IRA) supervision. This exam covers the fundamental concepts of IFRS 17 Insurance Contracts standard.',
    TRUE,
    24, -- 4×1 + 10×2 = 24 total marks
    60,
    60, -- 60 minutes
    FALSE,
    TRUE,
    1, -- One attempt allowed
    'Welcome to the IRA IFRS 17 Online Examination.

Instructions:
1. You have 60 minutes to complete this exam.
2. The exam consists of 14 multiple-choice questions.
3. Each question has only one correct answer.
4. Questions carry different marks (1 or 2 marks each).
5. You need 60% to pass (minimum 15 out of 24 marks).
6. Your answers are automatically saved as you progress.
7. You can navigate between questions using Previous/Next buttons.
8. Once submitted, you cannot modify your answers.
9. After submission, you will see your results with explanations.

Good luck!'
);

-- ============================================================================
-- 2. INSERT QUESTIONS AND OPTIONS
-- ============================================================================

-- Question 1 (1 mark)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111101',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1,
    'What is global date of Initial Application of IFRS 17 for insurance companies under National Insurance Commission''s supervision? When did IFRS 17 Standard start applying?',
    1,
    'IFRS 17 is effective for annual reporting periods beginning on or after 1 January 2023, which is the global initial application date.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111101', 'A', '31 Dec 2023', FALSE, 1),
('b1111111-1111-4111-8111-111111111101', 'B', '1 Jan 2022', FALSE, 2),
('b1111111-1111-4111-8111-111111111101', 'C', '1 Jan 2023', TRUE, 3),
('b1111111-1111-4111-8111-111111111101', 'D', '31 Dec 2021', FALSE, 4);

-- Question 2 (1 mark)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111102',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    2,
    'When the National Insurance Commission (NIC) is supervising insurers, which of the methods below does it NOT expect to see as an IFRS 17 application method?',
    1,
    'IFRS 17 recognises three measurement approaches: General Measurement Model (GMM), Premium Allocation Approach (PAA) and Variable Fee Approach (VFA). "General Allocation Approach" is not an IFRS 17 method.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111102', 'A', 'Premium Allocation Approach', FALSE, 1),
('b1111111-1111-4111-8111-111111111102', 'B', 'General Allocation Approach', TRUE, 2),
('b1111111-1111-4111-8111-111111111102', 'C', 'General Measurement Model', FALSE, 3),
('b1111111-1111-4111-8111-111111111102', 'D', 'Variable Fee Approach', FALSE, 4);

-- Question 3 (1 mark)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111103',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    3,
    'Which Balance Sheet entry item below is NOT expected to be shown by an insurer while implementing IFRS 17?',
    1,
    'Under IFRS 17, many cash flows that used to appear as "premium receivables" are incorporated into the measurement of the insurance contract asset or liability, rather than shown as a separate "Premium Receivables from Policyholders" line.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111103', 'A', 'Insurance Contract Liabilities', FALSE, 1),
('b1111111-1111-4111-8111-111111111103', 'B', 'Premium Receivables from Policyholders', TRUE, 2),
('b1111111-1111-4111-8111-111111111103', 'C', 'Reinsurance Contract Assets', FALSE, 3),
('b1111111-1111-4111-8111-111111111103', 'D', 'Insurance Contract Assets', FALSE, 4);

-- Question 4 (1 mark)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111104',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    4,
    'Which Profit & Loss entry item below is NOT expected to be shown by an insurer while implementing IFRS 17?',
    1,
    'IFRS 17 replaces "Gross Written Premium" with "Insurance Revenue". Expenses such as management expenses, acquisition costs and incurred claims continue to be recognised as part of insurance service expenses.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111104', 'A', 'Gross Written Premium', TRUE, 1),
('b1111111-1111-4111-8111-111111111104', 'B', 'Management Expenses', FALSE, 2),
('b1111111-1111-4111-8111-111111111104', 'C', 'Commissions (Insurance Acquisition Costs)', FALSE, 3),
('b1111111-1111-4111-8111-111111111104', 'D', 'Incurred Claims', FALSE, 4);

-- Question 5 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111105',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    5,
    'IFRS 17 requires that the insurer establishes a new reserve called Contractual Service Margin ("CSM"). What does this reserve represent?',
    2,
    'The CSM represents the unearned profit the insurer will recognise as it provides insurance coverage and services in future periods.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111105', 'A', 'Unpaid Claims', FALSE, 1),
('b1111111-1111-4111-8111-111111111105', 'B', 'Unearned Profit', TRUE, 2),
('b1111111-1111-4111-8111-111111111105', 'C', 'Earned Premium', FALSE, 3),
('b1111111-1111-4111-8111-111111111105', 'D', 'Risk Adjustment', FALSE, 4);

-- Question 6 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111106',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    6,
    'The Risk Adjustment margin for non-financial risks can be considered as',
    2,
    'The risk adjustment is part of the measurement of insurance contract liabilities, often viewed as part of premium and claims reserves reflecting compensation for non-financial risk.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111106', 'A', 'Part of Gross Written Premium', FALSE, 1),
('b1111111-1111-4111-8111-111111111106', 'B', 'Part of Shareholder Funds', FALSE, 2),
('b1111111-1111-4111-8111-111111111106', 'C', 'Part of Premium & Claims Reserves', TRUE, 3),
('b1111111-1111-4111-8111-111111111106', 'D', 'Part of Intangible Assets', FALSE, 4);

-- Question 7 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111107',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    7,
    'The Liability for Incurred Claims (LIC) is composed of',
    2,
    'LIC includes the present value of expected cash flows for incurred claims (reported and IBNR) plus the risk adjustment for non-financial risk associated with those cash flows.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111107', 'A', 'Liability for Remaining Coverage & Risk Adjustment Margin', FALSE, 1),
('b1111111-1111-4111-8111-111111111107', 'B', 'Outstanding Claim Reserves and Incurred But Not Reported Reserves & Risk Adjustment for Non-Financial Risks', TRUE, 2),
('b1111111-1111-4111-8111-111111111107', 'C', 'Contractual Service Margin & Risk Adjustment Margin for Non-Financial Risks', FALSE, 3),
('b1111111-1111-4111-8111-111111111107', 'D', 'Premium & Risk Adjustment Margin for Non-Financial Risks', FALSE, 4);

-- Question 8 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111108',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    8,
    'How does IFRS 17 Standard expect the insurer and the National Insurance Commission to monitor how the discounting of cashflows is being unwound as the payment date gets closer?',
    2,
    'The unwinding of discounting and the impact of financial risks are presented in Insurance Finance Income or Expense under IFRS 17.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111108', 'A', 'Through Contractual Service Margin', FALSE, 1),
('b1111111-1111-4111-8111-111111111108', 'B', 'Through Insurance Finance Expense', TRUE, 2),
('b1111111-1111-4111-8111-111111111108', 'C', 'Through Risk Adjustment Margin for Non-Financial Risks', FALSE, 3),
('b1111111-1111-4111-8111-111111111108', 'D', 'Through Shareholder Funds', FALSE, 4);

-- Question 9 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111109',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    9,
    'If all the policyholders fully pay their premium on time, the "Insurance Revenue" of a General Insurance Company can be compared to',
    2,
    'When premiums are fully paid on time, the pattern of insurance revenue under IFRS 17 is broadly comparable to gross earned premium for the period.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111109', 'A', 'Gross Written Premium', FALSE, 1),
('b1111111-1111-4111-8111-111111111109', 'B', 'Gross Earned Premium', TRUE, 2),
('b1111111-1111-4111-8111-111111111109', 'C', 'Net Earned Premium', FALSE, 3),
('b1111111-1111-4111-8111-111111111109', 'D', 'New Written Premium', FALSE, 4);

-- Question 10 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111110',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    10,
    'IFRS17 has a new view on how reinsurance contracts should be treated. The spirit of the new approach is',
    2,
    'IFRS 17 requires reinsurance contracts held to be accounted for separately from underlying contracts, highlighting the cost and effect of reinsurance rather than netting everything together.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111110', 'A', 'Combine all reinsurance cashflows and policyholder cashflows to get a net position.', FALSE, 1),
('b1111111-1111-4111-8111-111111111110', 'B', 'Separate all reinsurance cashflows from policyholder cashflows and report the net cost of reinsurance separately.', TRUE, 2),
('b1111111-1111-4111-8111-111111111110', 'C', 'Combine only premium reinsurance cashflows and policyholder cashflows and separate claims cashflows.', FALSE, 3),
('b1111111-1111-4111-8111-111111111110', 'D', 'Combine only claims reinsurance cashflows and policyholder cashflows and separate premium cashflows.', FALSE, 4);

-- Question 11 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    11,
    'IFRS 17 has made some changes to how claim reserves should be treated when it comes to time value of money. The spirit of the new approach is',
    2,
    'IFRS 17 requires discounting where the time value of money is significant (typically long-tail claims). For shorter-duration claims where the time value is not significant, discounting may not be required.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111111', 'A', 'The insurer has the choice of discounting or not regardless of when the claim is expected to be paid', FALSE, 1),
('b1111111-1111-4111-8111-111111111111', 'B', 'All claims expected to be paid after a year should be discounted and those expected to be paid in less than one year should also be discounted.', FALSE, 2),
('b1111111-1111-4111-8111-111111111111', 'C', 'All claims expected to be paid after a year should be discounted and those expected to be paid in less than one year can be discounted or not depending on the choice of the insurer.', TRUE, 3),
('b1111111-1111-4111-8111-111111111111', 'D', 'All claims must be discounted regardless of expected payment date.', FALSE, 4);

-- Question 12 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111112',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    12,
    'Some people say adoption of IFRS 17 should be encouraged by regulators, such as National Insurance Commission (NIC), because it encourages CASH and CARRY by',
    2,
    'IFRS 17 focuses revenue recognition on services provided and cash flows actually expected to be collected, reducing recognition of income from uncollected premiums—hence the "cash and carry" notion.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111112', 'A', 'Not considering Premium Receivables in the Balance Sheet', FALSE, 1),
('b1111111-1111-4111-8111-111111111112', 'B', 'Ignoring Uncollected Premium in Income', TRUE, 2),
('b1111111-1111-4111-8111-111111111112', 'C', 'It considers premium only if claims have been paid', FALSE, 3),
('b1111111-1111-4111-8111-111111111112', 'D', 'It discounts claims', FALSE, 4);

-- Question 13 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111113',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    13,
    'When an insurer discounts its liabilities at a higher rate than what it is expecting to earn, the National Insurance Commission (NIC) can easily detect this in the Profit & Loss Account by looking at',
    2,
    'A mismatch between discount rates applied to liabilities and the actual investment return will show up in the net financial result (combining finance income on assets and finance expense on insurance liabilities).',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111113', 'A', 'Insurance Revenue', FALSE, 1),
('b1111111-1111-4111-8111-111111111113', 'B', 'Insurance Service Expenses', FALSE, 2),
('b1111111-1111-4111-8111-111111111113', 'C', 'Net Financial Results', TRUE, 3),
('b1111111-1111-4111-8111-111111111113', 'D', 'Insurance Service Results', FALSE, 4);

-- Question 14 (2 marks)
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'b1111111-1111-4111-8111-111111111114',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    14,
    'Under the General Measurement Model (GMM), the insurance contract liabilities or assets are composed of',
    2,
    'Under IFRS 17''s GMM, the net position for insurance contracts is split between Liability for Remaining Coverage (LRC) and Liability for Incurred Claims (LIC), which together may form a net liability or asset.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('b1111111-1111-4111-8111-111111111114', 'A', 'Liability for Remaining Coverage & Risk Adjustment Margin', FALSE, 1),
('b1111111-1111-4111-8111-111111111114', 'B', 'Liability for Remaining Coverage & Liability for Incurred Claims', TRUE, 2),
('b1111111-1111-4111-8111-111111111114', 'C', 'Contractual Service Margin & Liability for Incurred Claims', FALSE, 3),
('b1111111-1111-4111-8111-111111111114', 'D', 'Premium, Outstanding Claim Reserves and Incurred But Not Reported Reserves', FALSE, 4);

-- ============================================================================
-- 3. VERIFY SEED DATA
-- ============================================================================

-- Verify exam was created
DO $$
DECLARE
    v_exam_count INTEGER;
    v_question_count INTEGER;
    v_option_count INTEGER;
    v_total_marks INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_exam_count FROM public.exams WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    SELECT COUNT(*) INTO v_question_count FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    SELECT COUNT(*) INTO v_option_count FROM public.options WHERE question_id IN (
        SELECT id FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    );
    SELECT SUM(marks) INTO v_total_marks FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    RAISE NOTICE 'Seed data verification:';
    RAISE NOTICE '  Exams created: %', v_exam_count;
    RAISE NOTICE '  Questions created: %', v_question_count;
    RAISE NOTICE '  Options created: %', v_option_count;
    RAISE NOTICE '  Total marks: %', v_total_marks;
    
    IF v_exam_count != 1 THEN
        RAISE EXCEPTION 'Expected 1 exam, found %', v_exam_count;
    END IF;
    
    IF v_question_count != 14 THEN
        RAISE EXCEPTION 'Expected 14 questions, found %', v_question_count;
    END IF;
    
    IF v_option_count != 56 THEN
        RAISE EXCEPTION 'Expected 56 options (14 questions × 4 options), found %', v_option_count;
    END IF;
    
    IF v_total_marks != 24 THEN
        RAISE EXCEPTION 'Expected 24 total marks, found %', v_total_marks;
    END IF;
    
    RAISE NOTICE 'Seed data verification passed!';
END $$;
