-- ============================================================================
-- IRA IFRS 17 Exam System - Updated Questions (35 Questions)
-- ============================================================================
-- This migration replaces the existing 14 questions with 35 updated questions.
-- Total marks: 100 (35 questions × ~2.857 marks each)
-- ============================================================================

-- ============================================================================
-- 1. DELETE EXISTING QUESTIONS AND OPTIONS
-- ============================================================================

-- Delete options for existing questions
DELETE FROM public.options WHERE question_id IN (
    SELECT id FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Delete existing questions
DELETE FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================================================
-- 2. UPDATE EXAM METADATA
-- ============================================================================

UPDATE public.exams
SET 
    total_marks = 100,
    description = 'Online assessment of IFRS 17 knowledge for insurers under Insurance Regulatory Authority (IRA) supervision. This exam covers the fundamental concepts of IFRS 17 Insurance Contracts standard including scope, measurement models, aggregation, and reinsurance.',
    instructions = 'Welcome to the IRA IFRS 17 Online Examination.

Instructions:
1. You have 70 minutes to complete this exam.
2. The exam consists of 35 multiple-choice questions.
3. Each question has only one correct answer.
4. Each question carries approximately 2.86 marks.
5. You need 60% to pass (minimum 60 out of 100 marks).
6. Your answers are automatically saved as you progress.
7. You can navigate between questions using Previous/Next buttons.
8. Once submitted, you cannot modify your answers.
9. After submission, you will see your results with explanations.

Good luck!'
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================================================
-- 3. INSERT NEW QUESTIONS AND OPTIONS
-- ============================================================================

-- Question 1
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111101',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1,
    'What is the primary objective of IFRS 17?',
    2.76,
    'IFRS 17 aims to create a consistent accounting framework for insurance contracts to improve transparency and comparability.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111101', 'A', 'To standardize insurance accounting globally', TRUE, 1),
('c1111111-1111-4111-8111-111111111101', 'B', 'To replace IFRS 16', FALSE, 2),
('c1111111-1111-4111-8111-111111111101', 'C', 'To define financial instruments', FALSE, 3),
('c1111111-1111-4111-8111-111111111101', 'D', 'To measure investment property', FALSE, 4);

-- Question 2
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111102',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    2,
    'What does IFRS 17 replace?',
    2.86,
    'IFRS 17 replaced IFRS 4, which was an interim standard.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111102', 'A', 'IAS 37', FALSE, 1),
('c1111111-1111-4111-8111-111111111102', 'B', 'IFRS 4', TRUE, 2),
('c1111111-1111-4111-8111-111111111102', 'C', 'IFRS 9', FALSE, 3),
('c1111111-1111-4111-8111-111111111102', 'D', 'IAS 40', FALSE, 4);

-- Question 3
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111103',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    3,
    'What was the official date of initial application for IFRS 17?',
    2.86,
    'The initial application date for IFRS 17 was 1st January 2023.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111103', 'A', '1st January 2022', FALSE, 1),
('c1111111-1111-4111-8111-111111111103', 'B', '31st December 2022', FALSE, 2),
('c1111111-1111-4111-8111-111111111103', 'C', '1st January 2023', TRUE, 3),
('c1111111-1111-4111-8111-111111111103', 'D', '1st January 2021', FALSE, 4);

-- Question 4
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111104',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    4,
    'Which of the following contracts falls under the scope of IFRS 17?',
    2.86,
    'Reinsurance contracts held are explicitly included under IFRS 17''s scope.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111104', 'A', 'Product warranty issued by a retailer', FALSE, 1),
('c1111111-1111-4111-8111-111111111104', 'B', 'Lease contract under IFRS 16', FALSE, 2),
('c1111111-1111-4111-8111-111111111104', 'C', 'Financial guarantee contract under IFRS 9', FALSE, 3),
('c1111111-1111-4111-8111-111111111104', 'D', 'Reinsurance contract held by an insurer', TRUE, 4);

-- Question 5
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111105',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    5,
    'An insurer enters into two separate contracts with the same policyholder at the same time. Contract A provides insurance coverage, while Contract B negates the financial exposure of Contract A entirely. According to IFRS 17, how should the insurer report these contracts?',
    2.86,
    'When contracts are designed to achieve an overall commercial effect (such as one negating the obligations of another), IFRS 17 requires treating them as a single arrangement to reflect the economic substance.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111105', 'A', 'Treat the contracts as a single arrangement because they achieve an overall commercial effect', TRUE, 1),
('c1111111-1111-4111-8111-111111111105', 'B', 'Report both contracts separately as independent arrangements', FALSE, 2),
('c1111111-1111-4111-8111-111111111105', 'C', 'Recognize only Contract A since it was issued first', FALSE, 3),
('c1111111-1111-4111-8111-111111111105', 'D', 'Disclose both contracts but report them under IFRS 9', FALSE, 4);

-- Question 6
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111106',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    6,
    'An insurer bundles multiple policies for a corporate client into a package with interdependent pricing. Some policies provide coverage, while others hedge specific risks associated with the insured entity. Under IFRS 17, how should these contracts be accounted for?',
    2.86,
    'IFRS 17 mandates that contracts designed to work together as a package with shared pricing or risk mitigation should be combined to reflect their true economic impact.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111106', 'A', 'Each contract must be evaluated individually regardless of interdependencies', FALSE, 1),
('c1111111-1111-4111-8111-111111111106', 'B', 'The bundled contracts should be treated as a single unit if they collectively achieve an overall commercial effect', TRUE, 2),
('c1111111-1111-4111-8111-111111111106', 'C', 'Contracts should be separated since they have different durations', FALSE, 3),
('c1111111-1111-4111-8111-111111111106', 'D', 'Each contract should be reported based on legal form rather than economic substance', FALSE, 4);

-- Question 7
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111107',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    7,
    'Which of the following scenarios would not require the combination of contracts under IFRS 17?',
    2.86,
    'If contracts have no interdependent pricing or risk structure, they do not need to be combined under IFRS 17. Separation is appropriate in such cases.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111107', 'A', 'Two insurance contracts issued simultaneously to the same policyholder, with pricing designed to work together', FALSE, 1),
('c1111111-1111-4111-8111-111111111107', 'B', 'A reinsurance contract that fully offsets the risk of an insurance policy issued by the same insurer', FALSE, 2),
('c1111111-1111-4111-8111-111111111107', 'C', 'An insurance contract and an investment product sold separately with no dependency in pricing or risk', TRUE, 3),
('c1111111-1111-4111-8111-111111111107', 'D', 'A life insurance contract and a rider that cancels all coverage in the main policy', FALSE, 4);

-- Question 8
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111108',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    8,
    'A life insurer offers a package where a main policy includes both insurance coverage and an investment component. The investment feature provides financial returns that could exist independently without the insurance portion. How should the insurer treat this arrangement under IFRS 17?',
    2.86,
    'IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111108', 'A', 'Recognize it as a single insurance contract', FALSE, 1),
('c1111111-1111-4111-8111-111111111108', 'B', 'Treat the entire contract under IFRS 9', FALSE, 2),
('c1111111-1111-4111-8111-111111111108', 'C', 'Combine the investment component only if it exceeds 50% of total premiums', FALSE, 3),
('c1111111-1111-4111-8111-111111111108', 'D', 'Separate the investment component if it can be sold independently', TRUE, 4);

-- Question 9
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111109',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    9,
    'What is the main purpose of aggregation under IFRS 17?',
    2.86,
    'Aggregation helps ensure that profits and losses are recognized accurately and consistently in financial reporting.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111109', 'A', 'To reduce the number of contracts reported', FALSE, 1),
('c1111111-1111-4111-8111-111111111109', 'B', 'To ensure accurate timing of profit and loss recognition', TRUE, 2),
('c1111111-1111-4111-8111-111111111109', 'C', 'To make contract management easier', FALSE, 3),
('c1111111-1111-4111-8111-111111111109', 'D', 'To avoid having to assess individual contracts', FALSE, 4);

-- Question 10
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111110',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    10,
    'How does IFRS 17 recommend handling groups of contracts under the Premium Allocation Approach (PAA)?',
    2.86,
    'IFRS 17 allows insurers applying the PAA to assume contracts are not onerous at initial recognition, unless evidence indicates otherwise.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111110', 'A', 'Assume they are always profitable', FALSE, 1),
('c1111111-1111-4111-8111-111111111110', 'B', 'Assume all contracts are onerous', FALSE, 2),
('c1111111-1111-4111-8111-111111111110', 'C', 'Group them based on product type only', FALSE, 3),
('c1111111-1111-4111-8111-111111111110', 'D', 'Assume none are onerous at initial recognition unless facts suggest otherwise', TRUE, 4);

-- Question 11
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    11,
    'What additional check must be done for policies eligible for the General Measurement Model (GMM)?',
    2.86,
    'Sensitivity testing and internal reporting are used to confirm profitability assumptions for GMM-eligible contracts.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111111', 'A', 'Verification of market premium rates', FALSE, 1),
('c1111111-1111-4111-8111-111111111111', 'B', 'Sensitivity testing and internal report reviews', TRUE, 2),
('c1111111-1111-4111-8111-111111111111', 'C', 'Reinsurance matching', FALSE, 3),
('c1111111-1111-4111-8111-111111111111', 'D', 'Underwriter interviews', FALSE, 4);

-- Question 12
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111112',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    12,
    'What happens if a contract becomes onerous after initial recognition?',
    2.86,
    'Group compositions are fixed at initial recognition, even if a contract''s status changes later.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111112', 'A', 'The group composition remains unchanged', TRUE, 1),
('c1111111-1111-4111-8111-111111111112', 'B', 'It is moved to the ''onerous'' group retroactively', FALSE, 2),
('c1111111-1111-4111-8111-111111111112', 'C', 'The contract is cancelled', FALSE, 3),
('c1111111-1111-4111-8111-111111111112', 'D', 'A new group is created', FALSE, 4);

-- Question 13
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111113',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    13,
    'When must a group of insurance contracts be recognized under IFRS 17?',
    2.86,
    'IFRS 17 requires recognition at the earliest of these three trigger events.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111113', 'A', 'At the end of the reporting period', FALSE, 1),
('c1111111-1111-4111-8111-111111111113', 'B', 'When the last payment is received', FALSE, 2),
('c1111111-1111-4111-8111-111111111113', 'C', 'When the policyholder signs the contract', FALSE, 3),
('c1111111-1111-4111-8111-111111111113', 'D', 'At the earliest of the coverage period start, first payment due, or when the group becomes onerous', TRUE, 4);

-- Question 14
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111114',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    14,
    'What is the treatment if IACFs are not immediately expensed?',
    2.86,
    'IACFs are treated separately until the related group is recognized.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111114', 'A', 'They are recognized as an asset or liability', TRUE, 1),
('c1111111-1111-4111-8111-111111111114', 'B', 'They are deferred revenue', FALSE, 2),
('c1111111-1111-4111-8111-111111111114', 'C', 'They are added to the CSM', FALSE, 3),
('c1111111-1111-4111-8111-111111111114', 'D', 'They are amortized over the contract term', FALSE, 4);

-- Question 15
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111115',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    15,
    'How often can the discount rate be changed for a group?',
    2.86,
    'The rate is updated only if new contracts added after the reporting period affect it.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111115', 'A', 'Monthly', FALSE, 1),
('c1111111-1111-4111-8111-111111111115', 'B', 'Only if new contracts are added that change it', TRUE, 2),
('c1111111-1111-4111-8111-111111111115', 'C', 'Once a year', FALSE, 3),
('c1111111-1111-4111-8111-111111111115', 'D', 'Never', FALSE, 4);

-- Question 16
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111116',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    16,
    'Which cash flows should be included in the measurement of the contract at initial recognition?',
    2.86,
    'Fulfilment cash flows include expected future premiums and claims.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111116', 'A', 'Past claims only', FALSE, 1),
('c1111111-1111-4111-8111-111111111116', 'B', 'Cash flows related to investment returns', FALSE, 2),
('c1111111-1111-4111-8111-111111111116', 'C', 'Future premiums and claim payments', TRUE, 3),
('c1111111-1111-4111-8111-111111111116', 'D', 'Marketing expenses', FALSE, 4);

-- Question 17
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111117',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    17,
    'What happens to a day-1 gain under IFRS 17?',
    2.86,
    'CSM defers day-1 gains and recognizes them over the service period.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111117', 'A', 'Deferred in CSM', TRUE, 1),
('c1111111-1111-4111-8111-111111111117', 'B', 'Recognized as revenue', FALSE, 2),
('c1111111-1111-4111-8111-111111111117', 'C', 'Transferred to retained earnings', FALSE, 3),
('c1111111-1111-4111-8111-111111111117', 'D', 'Recorded as OCI', FALSE, 4);

-- Question 18
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111118',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    18,
    'Under which model is no CSM typically recognized?',
    2.86,
    'PAA does not require a CSM unless the contract is deemed onerous.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111118', 'A', 'GMM', FALSE, 1),
('c1111111-1111-4111-8111-111111111118', 'B', 'PAA', TRUE, 2),
('c1111111-1111-4111-8111-111111111118', 'C', 'VFA', FALSE, 3),
('c1111111-1111-4111-8111-111111111118', 'D', 'Modified GMM', FALSE, 4);

-- Question 19
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111119',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    19,
    'Which of the following is a valid reason to apply the Premium Allocation Approach (PAA) at initial recognition?',
    2.86,
    'PAA may be used if it would not materially differ from the GMM measurement, especially for short-duration contracts.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111119', 'A', 'It results in higher revenue.', FALSE, 1),
('c1111111-1111-4111-8111-111111111119', 'B', 'The contract has a coverage period of more than one year', FALSE, 2),
('c1111111-1111-4111-8111-111111111119', 'C', 'The simplification does not significantly differ from GMM results', TRUE, 3),
('c1111111-1111-4111-8111-111111111119', 'D', 'It avoids recognition of acquisition costs', FALSE, 4);

-- Question 20
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111120',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    20,
    'Which changes are excluded from adjusting the CSM?',
    2.86,
    'Changes from the passage of time (interest accretion) affect finance income/expense rather than adjusting the CSM.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111120', 'A', 'Future service estimates', FALSE, 1),
('c1111111-1111-4111-8111-111111111120', 'B', 'Time value updates', TRUE, 2),
('c1111111-1111-4111-8111-111111111120', 'C', 'Risk of lapses', FALSE, 3),
('c1111111-1111-4111-8111-111111111120', 'D', 'Policyholder behavior assumptions', FALSE, 4);

-- Question 21
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111121',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    21,
    'What does the Liability for Remaining Coverage (LRC) include?',
    2.86,
    'LRC comprises fulfilment cash flows related to future coverage and the unearned profit (CSM).',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111121', 'A', 'CSM + premiums received', FALSE, 1),
('c1111111-1111-4111-8111-111111111121', 'B', 'Fulfilment cash flows + CSM', TRUE, 2),
('c1111111-1111-4111-8111-111111111121', 'C', 'Only claims paid', FALSE, 3),
('c1111111-1111-4111-8111-111111111121', 'D', 'Gross income', FALSE, 4);

-- Question 22
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111122',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    22,
    'What role does the risk adjustment play in subsequent measurement?',
    2.86,
    'Risk adjustment captures the uncertainty in future cash flows and is re-measured at each reporting date.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111122', 'A', 'Reduces cash flows', FALSE, 1),
('c1111111-1111-4111-8111-111111111122', 'B', 'Defers tax', FALSE, 2),
('c1111111-1111-4111-8111-111111111122', 'C', 'Adjusts for uncertainty in non-financial risks', TRUE, 3),
('c1111111-1111-4111-8111-111111111122', 'D', 'Ignores future inflation', FALSE, 4);

-- Question 23
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111123',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    23,
    'What is the primary distinction between the bottom-up and top-down approaches for deriving discount rates under IFRS 17?',
    2.86,
    'The bottom-up approach begins with a liquid risk-free yield curve and adjusts it to reflect the liquidity characteristics and other factors relevant to the insurance contracts.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111123', 'A', 'The bottom-up approach starts from asset returns and adjusts for insurance features', FALSE, 1),
('c1111111-1111-4111-8111-111111111123', 'B', 'The top-down approach uses a risk-free curve and adds risk premiums', FALSE, 2),
('c1111111-1111-4111-8111-111111111123', 'C', 'The top-down approach always requires matching the exact liquidity of insurance contracts.', FALSE, 3),
('c1111111-1111-4111-8111-111111111123', 'D', 'The bottom-up approach starts with a liquid risk-free yield curve and adjusts for illiquidity', TRUE, 4);

-- Question 24
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111124',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    24,
    'Can a loss component (LC) established for an onerous group of contracts under IFRS 17 be reversed in subsequent periods?',
    2.86,
    'Future favorable changes in fulfilment cash flows can indicate that the group is no longer onerous, allowing reversal of the loss component.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111124', 'A', 'No, once established, a loss component cannot be reversed.', FALSE, 1),
('c1111111-1111-4111-8111-111111111124', 'B', 'Yes, but only through adjustments to the Risk Adjustment for non-financial risk.', FALSE, 2),
('c1111111-1111-4111-8111-111111111124', 'C', 'Only if the contracts are derecognized.', FALSE, 3),
('c1111111-1111-4111-8111-111111111124', 'D', 'Yes, if future changes in fulfilment cash flows indicate that the group is no longer onerous.', TRUE, 4);

-- Question 25
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111125',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    25,
    'Which discount rate is used to accrete interest on the CSM?',
    2.86,
    'Interest on the CSM is accreted using the locked-in discount rate set at initial recognition of the group.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111125', 'A', 'The risk-free rate at the reporting date', FALSE, 1),
('c1111111-1111-4111-8111-111111111125', 'B', 'The weighted average discount rate for incurred claims', FALSE, 2),
('c1111111-1111-4111-8111-111111111125', 'C', 'The current market interest rate for government bonds', FALSE, 3),
('c1111111-1111-4111-8111-111111111125', 'D', 'The discount rate at initial recognition of the group of contracts', TRUE, 4);

-- Question 26
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111126',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    26,
    'Which of the following risks is excluded from the IFRS 17 risk adjustment?',
    2.86,
    'The risk adjustment covers non-financial risks only. Financial risks are reflected in discount rates or cash flows, not the risk adjustment.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111126', 'A', 'Lapse risk', FALSE, 1),
('c1111111-1111-4111-8111-111111111126', 'B', 'Expense risk', FALSE, 2),
('c1111111-1111-4111-8111-111111111126', 'C', 'Financial risk (e.g. interest rate risk)', TRUE, 3),
('c1111111-1111-4111-8111-111111111126', 'D', 'Morbidity risk', FALSE, 4);

-- Question 27
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111127',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    27,
    'How is the CSM treated for onerous contracts?',
    2.86,
    'The CSM is set to zero since no future profits are expected.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111127', 'A', 'Deferred', FALSE, 1),
('c1111111-1111-4111-8111-111111111127', 'B', 'Reversed', FALSE, 2),
('c1111111-1111-4111-8111-111111111127', 'C', 'Released to profit', FALSE, 3),
('c1111111-1111-4111-8111-111111111127', 'D', 'Set to zero', TRUE, 4);

-- Question 28
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111128',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    28,
    'How is the loss component recognized?',
    2.86,
    'The loss component is recognized immediately in profit or loss.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111128', 'A', 'As an asset', FALSE, 1),
('c1111111-1111-4111-8111-111111111128', 'B', 'Through OCI', FALSE, 2),
('c1111111-1111-4111-8111-111111111128', 'C', 'As an adjustment to the CSM', FALSE, 3),
('c1111111-1111-4111-8111-111111111128', 'D', 'In profit or loss', TRUE, 4);

-- Question 29
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111129',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    29,
    'Which of the following changes can make a previously profitable contract group onerous?',
    2.86,
    'Increases in expected expenses can raise fulfilment cash flows, potentially making the group onerous.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111129', 'A', 'Increase in administrative expenses', TRUE, 1),
('c1111111-1111-4111-8111-111111111129', 'B', 'Drop in discount rates', FALSE, 2),
('c1111111-1111-4111-8111-111111111129', 'C', 'Revised premium allocation method', FALSE, 3),
('c1111111-1111-4111-8111-111111111129', 'D', 'Change in accounting policy', FALSE, 4);

-- Question 30
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111130',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    30,
    'What does the liability for remaining coverage (LRC) under PAA represent?',
    2.86,
    'LRC under PAA reflects the simplified unearned premium approach, adjusted for amortized acquisition costs.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111130', 'A', 'Future claims paid', FALSE, 1),
('c1111111-1111-4111-8111-111111111130', 'B', 'Present value of premiums', FALSE, 2),
('c1111111-1111-4111-8111-111111111130', 'C', 'The unearned portion of premiums minus acquisition costs', TRUE, 3),
('c1111111-1111-4111-8111-111111111130', 'D', 'Incurred claims', FALSE, 4);

-- Question 31
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111131',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    31,
    'Can insurers offset profitable and onerous contracts within a portfolio under PAA?',
    2.86,
    'IFRS 17 requires separate grouping of onerous and profitable contracts; losses cannot be offset by profitable ones.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111131', 'A', 'No, grouping rules prevent offsetting', TRUE, 1),
('c1111111-1111-4111-8111-111111111131', 'B', 'Only with auditor approval', FALSE, 2),
('c1111111-1111-4111-8111-111111111131', 'C', 'Yes', FALSE, 3),
('c1111111-1111-4111-8111-111111111131', 'D', 'Only for reinsurance', FALSE, 4);

-- Question 32
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111132',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    32,
    'Can a gain on purchase of reinsurance be recognized immediately?',
    2.86,
    'Gains on the purchase of reinsurance are deferred within the Contractual Service Margin (CSM) and recognized over the coverage period.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111132', 'A', 'Yes, it boosts profit', FALSE, 1),
('c1111111-1111-4111-8111-111111111132', 'B', 'No, it is included in the CSM', TRUE, 2),
('c1111111-1111-4111-8111-111111111132', 'C', 'Only if the reinsurer agrees', FALSE, 3),
('c1111111-1111-4111-8111-111111111132', 'D', 'Yes, under PAA', FALSE, 4);

-- Question 33
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111133',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    33,
    'How are changes in fulfilment cash flows for reinsurance contracts treated?',
    2.86,
    'Changes in fulfilment cash flows adjust the CSM if they relate to future services, or are recognized in profit or loss otherwise.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111133', 'A', 'Adjust the CSM or go through P&L', TRUE, 1),
('c1111111-1111-4111-8111-111111111133', 'B', 'Ignore until contract maturity', FALSE, 2),
('c1111111-1111-4111-8111-111111111133', 'C', 'Expensed as acquisition costs', FALSE, 3),
('c1111111-1111-4111-8111-111111111133', 'D', 'Deferred indefinitely', FALSE, 4);

-- Question 34
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111134',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    34,
    'How are reinsurance recoveries presented in the income statement?',
    2.86,
    'IFRS 17 requires that reinsurance income and expenses be presented separately from insurance revenue and service expenses.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111134', 'A', 'Included in insurance revenue', FALSE, 1),
('c1111111-1111-4111-8111-111111111134', 'B', 'Included in investment income', FALSE, 2),
('c1111111-1111-4111-8111-111111111134', 'C', 'Separately from insurance revenue', TRUE, 3),
('c1111111-1111-4111-8111-111111111134', 'D', 'Net of insurance service expenses', FALSE, 4);

-- Question 35
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c1111111-1111-4111-8111-111111111135',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    35,
    'What is the impact of a reinsurance CSM being negative?',
    2.86,
    'A negative CSM on a reinsurance contract held represents a net cost to the insurer and is treated as an asset.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c1111111-1111-4111-8111-111111111135', 'A', 'It represents a loss', FALSE, 1),
('c1111111-1111-4111-8111-111111111135', 'B', 'It is a liability', FALSE, 2),
('c1111111-1111-4111-8111-111111111135', 'C', 'It is not allowed', FALSE, 3),
('c1111111-1111-4111-8111-111111111135', 'D', 'It''s treated as an asset, not a liability', TRUE, 4);

-- ============================================================================
-- 4. VERIFY UPDATED DATA
-- ============================================================================

DO $$
DECLARE
    v_question_count INTEGER;
    v_option_count INTEGER;
    v_total_marks NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_question_count FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    SELECT COUNT(*) INTO v_option_count FROM public.options WHERE question_id IN (
        SELECT id FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    );
    SELECT SUM(marks) INTO v_total_marks FROM public.questions WHERE exam_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    RAISE NOTICE 'Updated data verification:';
    RAISE NOTICE '  Questions created: %', v_question_count;
    RAISE NOTICE '  Options created: %', v_option_count;
    RAISE NOTICE '  Total marks: %', v_total_marks;
    
    IF v_question_count != 35 THEN
        RAISE EXCEPTION 'Expected 35 questions, found %', v_question_count;
    END IF;
    
    IF v_option_count != 140 THEN
        RAISE EXCEPTION 'Expected 140 options (35 questions × 4 options), found %', v_option_count;
    END IF;
    
    RAISE NOTICE 'Updated data verification passed!';
END $$;
