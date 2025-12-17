-- ============================================================================
-- IRA IFRS 17 Exam System - Exam 2: Post-Training Assessment
-- ============================================================================
-- This migration seeds the second IFRS 17 exam with 30 questions.
-- Total marks: 100 (20 questions × 3 marks + 10 questions × 4 marks)
-- Pass mark: 60%
-- Duration: 45 minutes
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
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'IFRS 17 Post-Training Assessment',
    'Comprehensive assessment of IFRS 17 knowledge covering all 10 modules: Fundamentals, Combination & Separation, Level of Aggregation, Recognition, Initial Measurement, Subsequent Measurement, Discounting & Risk Adjustment, Onerous Contracts, Premium Allocation Approach, and Reinsurance Contracts Held.',
    TRUE,
    100, -- 20×3 + 10×4 = 100 total marks
    60,
    45, -- 45 minutes
    FALSE,
    TRUE,
    3, -- Three attempts allowed
    'Welcome to the IFRS 17 Post-Training Assessment.

Instructions:
1. You have 45 minutes to complete this exam.
2. The exam consists of 30 multiple-choice questions across 10 modules.
3. Each question has only one correct answer.
4. Questions 1-20 carry 3 marks each (60 marks total).
5. Questions 21-30 carry 4 marks each (40 marks total).
6. You need 60% to pass (minimum 60 out of 100 marks).
7. Your answers are automatically saved as you progress.
8. You can navigate between questions using Previous/Next buttons.
9. Once submitted, you cannot modify your answers.
10. After submission, you will see your results with explanations.

Good luck!'
);

-- ============================================================================
-- 2. INSERT QUESTIONS AND OPTIONS
-- ============================================================================
-- Questions are ordered by Module No for logical flow
-- Q1-Q20: 3 marks each | Q21-Q30: 4 marks each
-- ============================================================================

-- Question 1 (Module 1: IFRS 17 Fundamentals) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111101',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    1,
    'How does IFRS 17 define an insurance contract?',
    3,
    'This captures the essential element of IFRS 17: transferring insurance risk from policyholder to insurer.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111101', 'A', 'Contract transferring insurance risk', TRUE, 1),
('c2111111-1111-4111-8111-111111111101', 'B', 'Contract transferring investment risk', FALSE, 2),
('c2111111-1111-4111-8111-111111111101', 'C', 'Contract transferring liquidity risk', FALSE, 3),
('c2111111-1111-4111-8111-111111111101', 'D', 'Contract for investment advice', FALSE, 4);

-- Question 2 (Module 1: IFRS 17 Fundamentals) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111102',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    2,
    'How does IFRS 17 define ''insurance risk''?',
    3,
    'Insurance risk under IFRS 17 involves uncertainty about future events that may trigger insurer payment.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111102', 'A', 'The risk of policyholder default', FALSE, 1),
('c2111111-1111-4111-8111-111111111102', 'B', 'The risk of future investment losses', FALSE, 2),
('c2111111-1111-4111-8111-111111111102', 'C', 'The risk transferred from the policyholder to the insurer due to uncertain future events', TRUE, 3),
('c2111111-1111-4111-8111-111111111102', 'D', 'Exchange rate risk', FALSE, 4);

-- Question 3 (Module 1: IFRS 17 Fundamentals) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111103',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    3,
    'Are product warranties issued by a retailer within IFRS 17?',
    3,
    'Retail product warranties are covered by IAS 37, not IFRS 17.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111103', 'A', 'Yes, always', FALSE, 1),
('c2111111-1111-4111-8111-111111111103', 'B', 'No, they fall under IAS 37', TRUE, 2),
('c2111111-1111-4111-8111-111111111103', 'C', 'Only for 12-month terms', FALSE, 3),
('c2111111-1111-4111-8111-111111111103', 'D', 'Yes, if embedded in insurance', FALSE, 4);

-- Question 4 (Module 2: Combination & Separation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111104',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    4,
    'When should an insurance contract be recognized?',
    3,
    'Recognition occurs at the earliest of: coverage beginning, first payment due, or when a group becomes onerous.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111104', 'A', 'When the contract is signed', FALSE, 1),
('c2111111-1111-4111-8111-111111111104', 'B', 'At the beginning of coverage period, when first payment is due, or when onerous', TRUE, 2),
('c2111111-1111-4111-8111-111111111104', 'C', 'Only when claims are made', FALSE, 3),
('c2111111-1111-4111-8111-111111111104', 'D', 'At the end of the coverage period', FALSE, 4);

-- Question 5 (Module 2: Combination & Separation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111105',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    5,
    'What is a ''portfolio'' under IFRS 17?',
    3,
    'A portfolio comprises contracts with similar risks that are managed together.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111105', 'A', 'All contracts in the company', FALSE, 1),
('c2111111-1111-4111-8111-111111111105', 'B', 'Contracts subject to similar risks and managed together', TRUE, 2),
('c2111111-1111-4111-8111-111111111105', 'C', 'Only profitable contracts', FALSE, 3),
('c2111111-1111-4111-8111-111111111105', 'D', 'Contracts from the same year', FALSE, 4);

-- Question 6 (Module 2: Combination & Separation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111106',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    6,
    'An insurer issues two separate policies to the same corporate client—one covering property damage and another covering business interruption losses linked to that property. The premiums are interdependent and structured as a bundle to provide a cohesive risk solution. What is the appropriate IFRS 17 treatment?',
    3,
    'IFRS 17 requires combining contracts that are designed to function together commercially, particularly if pricing reflects mutual risk dependencies.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111106', 'A', 'The contracts should always be separated', FALSE, 1),
('c2111111-1111-4111-8111-111111111106', 'B', 'The contracts should be combined if pricing is interdependent', TRUE, 2),
('c2111111-1111-4111-8111-111111111106', 'C', 'The contracts must be accounted for under IFRS 9', FALSE, 3),
('c2111111-1111-4111-8111-111111111106', 'D', 'The contracts should be combined only if policyholders request it', FALSE, 4);

-- Question 7 (Module 3: Level of Aggregation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111107',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    7,
    'How far apart can contract issuance dates be within the same group?',
    3,
    'IFRS 17 requires that all contracts in a group are issued no more than one year apart.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111107', 'A', 'Any number of years', FALSE, 1),
('c2111111-1111-4111-8111-111111111107', 'B', 'Two years', FALSE, 2),
('c2111111-1111-4111-8111-111111111107', 'C', 'Not more than one year', TRUE, 3),
('c2111111-1111-4111-8111-111111111107', 'D', 'Three years if risk is similar', FALSE, 4);

-- Question 8 (Module 3: Level of Aggregation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111108',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    8,
    'Under IFRS 17, why are insurers not allowed to reassess contract groups after initial recognition?',
    3,
    'Fixing the groupings at initial recognition supports consistent, unbiased financial reporting over time.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111108', 'A', 'To maintain consistency and transparency in reporting', TRUE, 1),
('c2111111-1111-4111-8111-111111111108', 'B', 'To reduce workload', FALSE, 2),
('c2111111-1111-4111-8111-111111111108', 'C', 'To allow for more flexibility later', FALSE, 3),
('c2111111-1111-4111-8111-111111111108', 'D', 'Because contracts cannot change after issuance', FALSE, 4);

-- Question 9 (Module 3: Level of Aggregation) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111109',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    9,
    'What should an entity use to assess whether a contract might become onerous later?',
    3,
    'Entities must consider whether new or changing circumstances might render a contract onerous in the future.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111109', 'A', 'Market interest rates', FALSE, 1),
('c2111111-1111-4111-8111-111111111109', 'B', 'Past claims history only', FALSE, 2),
('c2111111-1111-4111-8111-111111111109', 'C', 'Likelihood of changes in applicable facts and circumstances', TRUE, 3),
('c2111111-1111-4111-8111-111111111109', 'D', 'Broker recommendations', FALSE, 4);

-- Question 10 (Module 4: Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111110',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    10,
    'If there is no contractual due date for the first payment, when is it considered due?',
    3,
    'IFRS 17 states that if no due date is set, the payment is considered due when received.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111110', 'A', 'At the end of the month', FALSE, 1),
('c2111111-1111-4111-8111-111111111110', 'B', 'When it is received', TRUE, 2),
('c2111111-1111-4111-8111-111111111110', 'C', 'After coverage starts', FALSE, 3),
('c2111111-1111-4111-8111-111111111110', 'D', 'When billed', FALSE, 4);

-- Question 11 (Module 4: Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111111',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    11,
    'When should an insurer assess if a contract is onerous?',
    3,
    'The standard requires a pre-recognition assessment if there''s an indication of onerousness.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111111', 'A', 'After recognition', FALSE, 1),
('c2111111-1111-4111-8111-111111111111', 'B', 'Before the earlier of coverage start or payment due', TRUE, 2),
('c2111111-1111-4111-8111-111111111111', 'C', 'At the end of the financial year', FALSE, 3),
('c2111111-1111-4111-8111-111111111111', 'D', 'Only when a loss is reported', FALSE, 4);

-- Question 12 (Module 4: Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111112',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    12,
    'Why is the initial recognition timing important under IFRS 17?',
    3,
    'Proper timing ensures that revenue, risk, and costs are reported accurately.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111112', 'A', 'It helps identify reinsurers', FALSE, 1),
('c2111111-1111-4111-8111-111111111112', 'B', 'It is used to calculate tax', FALSE, 2),
('c2111111-1111-4111-8111-111111111112', 'C', 'It helps with customer satisfaction', FALSE, 3),
('c2111111-1111-4111-8111-111111111112', 'D', 'It determines when revenue and expenses are recorded', TRUE, 4);

-- Question 13 (Module 5: Measurement on Initial Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111113',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    13,
    'If the fulfilment cash flows are negative, what does IFRS 17 require?',
    3,
    'Negative fulfilment cash flows indicate an onerous contract; a loss is recognized in profit or loss.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111113', 'A', 'Defer the difference', FALSE, 1),
('c2111111-1111-4111-8111-111111111113', 'B', 'Recognize a loss immediately', TRUE, 2),
('c2111111-1111-4111-8111-111111111113', 'C', 'Recognize a CSM', FALSE, 3),
('c2111111-1111-4111-8111-111111111113', 'D', 'Reduce the asset balance', FALSE, 4);

-- Question 14 (Module 5: Measurement on Initial Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111114',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    14,
    'Which discount rate is used for initial measurement?',
    3,
    'The locked-in rate at initial recognition is used to discount fulfilment cash flows and accrete CSM.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111114', 'A', 'Zero-coupon rate', FALSE, 1),
('c2111111-1111-4111-8111-111111111114', 'B', 'Locked-in discount rate', TRUE, 2),
('c2111111-1111-4111-8111-111111111114', 'C', 'Market average rate', FALSE, 3),
('c2111111-1111-4111-8111-111111111114', 'D', 'Prime lending rate', FALSE, 4);

-- Question 15 (Module 5: Measurement on Initial Recognition) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111115',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    15,
    'Which cost is not included in initial measurement?',
    3,
    'Only directly attributable acquisition costs are included. Indirect costs like general admin are excluded.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111115', 'A', 'Direct acquisition costs', FALSE, 1),
('c2111111-1111-4111-8111-111111111115', 'B', 'Expected claims', FALSE, 2),
('c2111111-1111-4111-8111-111111111115', 'C', 'Indirect administrative costs', TRUE, 3),
('c2111111-1111-4111-8111-111111111115', 'D', 'Risk adjustment', FALSE, 4);

-- Question 16 (Module 6: Subsequent Measurement) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111116',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    16,
    'What does subsequent measurement refer to under IFRS 17?',
    3,
    'Subsequent measurement involves updating the carrying amounts of insurance liabilities after initial recognition.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111116', 'A', 'The reassessment of reinsurance cash flows', FALSE, 1),
('c2111111-1111-4111-8111-111111111116', 'B', 'The update of contract liabilities after initial recognition', TRUE, 2),
('c2111111-1111-4111-8111-111111111116', 'C', 'Only the measurement of incurred claims', FALSE, 3),
('c2111111-1111-4111-8111-111111111116', 'D', 'Determining if premiums are received', FALSE, 4);

-- Question 17 (Module 6: Subsequent Measurement) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111117',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    17,
    'An insurance company issues a 4-year term life insurance contract with a total expected Contractual Service Margin (CSM) of $8,000 at initial recognition. The company expects to provide insurance services evenly over the 4 years. How much CSM revenue should be recognized at the end of each year, assuming no changes in estimates or contract modifications?',
    3,
    'Since the insurance company provides services evenly over 4 years, the $8,000 CSM is recognized as $2,000 per year.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111117', 'A', '$2,000 per year for 4 years', TRUE, 1),
('c2111111-1111-4111-8111-111111111117', 'B', '$0 in year 1 and $8,000 in year 4', FALSE, 2),
('c2111111-1111-4111-8111-111111111117', 'C', '$4,000 in the first year and $1,333 in each of the following years', FALSE, 3),
('c2111111-1111-4111-8111-111111111117', 'D', '$8,000 immediately at contract inception', FALSE, 4);

-- Question 18 (Module 6: Subsequent Measurement) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111118',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    18,
    'How are claims incurred shown in financials?',
    3,
    'Claims that relate to past service are recognized in profit or loss.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111118', 'A', 'In CSM', FALSE, 1),
('c2111111-1111-4111-8111-111111111118', 'B', 'In OCI', FALSE, 2),
('c2111111-1111-4111-8111-111111111118', 'C', 'In fulfilment cash flows', FALSE, 3),
('c2111111-1111-4111-8111-111111111118', 'D', 'In profit or loss', TRUE, 4);

-- Question 19 (Module 7: Discounting CSM and Risk Adjustment) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111119',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    19,
    'Which statement is TRUE regarding liquidity adjustments in the top-down approach under IFRS 17?',
    3,
    'IFRS 17 requires liquidity adjustments under the top-down approach only if the reference portfolio''s liquidity is not sufficiently consistent with that of the insurance contracts.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111119', 'A', 'Liquidity differences between the reference assets and insurance contracts must always be adjusted', FALSE, 1),
('c2111111-1111-4111-8111-111111111119', 'B', 'No liquidity adjustments are allowed under the top-down approach', FALSE, 2),
('c2111111-1111-4111-8111-111111111119', 'C', 'Adjustments are made only if the reference portfolio''s liquidity differs significantly from that of the insurance contracts', TRUE, 3),
('c2111111-1111-4111-8111-111111111119', 'D', 'Liquidity risk is already captured in the nominal cash flows, so no adjustments are required', FALSE, 4);

-- Question 20 (Module 7: Discounting CSM and Risk Adjustment) - 3 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111120',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    20,
    'When a group of insurance contracts becomes onerous after initial recognition under IFRS 17, what happens to the Contractual Service Margin (CSM)?',
    3,
    'If a group becomes onerous after initial recognition, IFRS 17 requires setting the CSM to zero and recognizing a loss component.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111120', 'A', 'It is increased to reflect the higher expected losses.', FALSE, 1),
('c2111111-1111-4111-8111-111111111120', 'B', 'It remains unchanged, as changes are only recognized at initial recognition.', FALSE, 2),
('c2111111-1111-4111-8111-111111111120', 'C', 'It is set to zero, and a loss component is established to reflect the excess of fulfilment cash flows over the expected inflows.', TRUE, 3),
('c2111111-1111-4111-8111-111111111120', 'D', 'It is transferred to the Liability for Incurred Claims (LIC).', FALSE, 4);

-- ============================================================================
-- Questions 21-30: 4 marks each (40 marks total)
-- ============================================================================

-- Question 21 (Module 7: Discounting CSM and Risk Adjustment) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111121',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    21,
    'Which of the following characteristics would lead to a higher risk adjustment according to IFRS 17 principles?',
    4,
    'Greater uncertainty in emerging experience heightens the need for a larger risk adjustment.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111121', 'A', 'High-frequency, low-severity risks', FALSE, 1),
('c2111111-1111-4111-8111-111111111121', 'B', 'Short-duration contracts with predictable claims', FALSE, 2),
('c2111111-1111-4111-8111-111111111121', 'C', 'Risks with narrow probability distributions', FALSE, 3),
('c2111111-1111-4111-8111-111111111121', 'D', 'Contracts where little is known about emerging experience', TRUE, 4);

-- Question 22 (Module 8: Onerous Contracts) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111122',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    22,
    'What happens to the CSM if a group of contracts becomes onerous after initial recognition?',
    4,
    'If contracts become onerous after initial recognition, the CSM is reduced to zero, and any further loss is recognized in profit or loss.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111122', 'A', 'It is increased', FALSE, 1),
('c2111111-1111-4111-8111-111111111122', 'B', 'It is set to zero and loss is recognized', TRUE, 2),
('c2111111-1111-4111-8111-111111111122', 'C', 'It is locked in', FALSE, 3),
('c2111111-1111-4111-8111-111111111122', 'D', 'It is recalculated using old assumptions', FALSE, 4);

-- Question 23 (Module 8: Onerous Contracts) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111123',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    23,
    'How does the loss component affect future insurance revenue?',
    4,
    'For onerous groups, the loss component replaces the CSM and is released as insurance revenue as coverage is provided.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111123', 'A', 'No effect', FALSE, 1),
('c2111111-1111-4111-8111-111111111123', 'B', 'Increases revenue', FALSE, 2),
('c2111111-1111-4111-8111-111111111123', 'C', 'It reduces future revenue', FALSE, 3),
('c2111111-1111-4111-8111-111111111123', 'D', 'It replaces CSM in revenue recognition', TRUE, 4);

-- Question 24 (Module 8: Onerous Contracts) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111124',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    24,
    'What causes a change in the loss component?',
    4,
    'Any adverse change in fulfilment cash flows increases the loss component.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111124', 'A', 'Increase in discount rate', FALSE, 1),
('c2111111-1111-4111-8111-111111111124', 'B', 'Change in reinsurance treaty', FALSE, 2),
('c2111111-1111-4111-8111-111111111124', 'C', 'Adverse claims development', TRUE, 3),
('c2111111-1111-4111-8111-111111111124', 'D', 'Policyholder death', FALSE, 4);

-- Question 25 (Module 9: Premium Allocation Approach) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111125',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    25,
    'What happens if the liability for remaining coverage is lower than fulfilment cash flows?',
    4,
    'If fulfilment cash flows exceed the liability for remaining coverage, the contract is deemed onerous and the excess is recognized as a loss.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111125', 'A', 'Create a contractual service margin', FALSE, 1),
('c2111111-1111-4111-8111-111111111125', 'B', 'Defer acquisition costs', FALSE, 2),
('c2111111-1111-4111-8111-111111111125', 'C', 'Recognize a loss', TRUE, 3),
('c2111111-1111-4111-8111-111111111125', 'D', 'Discount more', FALSE, 4);

-- Question 26 (Module 9: Premium Allocation Approach) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111126',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    26,
    'What are fulfilment cash flows made up of?',
    4,
    'Fulfilment cash flows reflect the present value of expected future inflows and outflows plus the risk adjustment for non-financial risk.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111126', 'A', 'Future premiums only', FALSE, 1),
('c2111111-1111-4111-8111-111111111126', 'B', 'Future claims and profits', FALSE, 2),
('c2111111-1111-4111-8111-111111111126', 'C', 'Expected future inflows and outflows, discounted, plus risk adjustment', TRUE, 3),
('c2111111-1111-4111-8111-111111111126', 'D', 'Written premium minus expenses', FALSE, 4);

-- Question 27 (Module 9: Premium Allocation Approach) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111127',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    27,
    'What is a key disclosure requirement under IFRS 17 even when using PAA?',
    4,
    'Disclosure of the confidence level used to determine the risk adjustment is required, even under the PAA approach.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111127', 'A', 'No disclosure required', FALSE, 1),
('c2111111-1111-4111-8111-111111111127', 'B', 'Confidence level of liabilities', TRUE, 2),
('c2111111-1111-4111-8111-111111111127', 'C', 'Market value of assets', FALSE, 3),
('c2111111-1111-4111-8111-111111111127', 'D', 'Tax provision for each contract', FALSE, 4);

-- Question 28 (Module 10: Reinsurance Contracts Held) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111128',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    28,
    'What is the impact of reinsurance on the insurer''s risk exposure?',
    4,
    'Reinsurance helps the insurer reduce and manage their insurance risk by transferring a portion of it to the reinsurer.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111128', 'A', 'Increases risk', FALSE, 1),
('c2111111-1111-4111-8111-111111111128', 'B', 'No impact', FALSE, 2),
('c2111111-1111-4111-8111-111111111128', 'C', 'Transfers and reduces risk', TRUE, 3),
('c2111111-1111-4111-8111-111111111128', 'D', 'Creates an additional liability', FALSE, 4);

-- Question 29 (Module 10: Reinsurance Contracts Held) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111129',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    29,
    'Under the General Model, what happens to the CSM for reinsurance contracts held over time?',
    4,
    'The CSM for reinsurance contracts held is released over time based on the receipt of reinsurance services.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111129', 'A', 'It grows with claims paid', FALSE, 1),
('c2111111-1111-4111-8111-111111111129', 'B', 'It''s released based on services received', TRUE, 2),
('c2111111-1111-4111-8111-111111111129', 'C', 'It remains constant', FALSE, 3),
('c2111111-1111-4111-8111-111111111129', 'D', 'It is immediately expensed', FALSE, 4);

-- Question 30 (Module 10: Reinsurance Contracts Held) - 4 marks
INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    'c2111111-1111-4111-8111-111111111130',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    30,
    'How are recoveries for past claims treated under reinsurance contracts held?',
    4,
    'Recoveries for past claims are immediately recognized in profit or loss as they relate to events that have already occurred.',
    TRUE
);

INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES
('c2111111-1111-4111-8111-111111111130', 'A', 'Deferred in CSM', FALSE, 1),
('c2111111-1111-4111-8111-111111111130', 'B', 'Expensed as incurred', FALSE, 2),
('c2111111-1111-4111-8111-111111111130', 'C', 'Recognized in profit or loss immediately', TRUE, 3),
('c2111111-1111-4111-8111-111111111130', 'D', 'Deducted from LRC', FALSE, 4);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Total marks verification:
-- Questions 1-20: 20 × 3 = 60 marks
-- Questions 21-30: 10 × 4 = 40 marks
-- Total: 100 marks ✓
-- ============================================================================
