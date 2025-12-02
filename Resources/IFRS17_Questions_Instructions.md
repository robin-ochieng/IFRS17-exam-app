# IFRS 17 Exam Questions Template

## Instructions for the Content Team

This document explains how to add new questions to the IFRS 17 Exam Application.

---

## 📁 Template File

The template file is located at:
```
Resources/IFRS17_Questions_Template.csv
```

You can open this file in **Microsoft Excel** or **Google Sheets** for easier editing.

---

## 📋 Column Descriptions

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| `question_number` | Sequential number for the question (continue from 15, 16, 17...) | ✅ Yes | `15` |
| `marks` | Points for this question (1 or 2) | ✅ Yes | `2` |
| `question_text` | The full question text | ✅ Yes | `What is the main purpose of IFRS 17?` |
| `option_a` | First answer choice | ✅ Yes | `To replace IFRS 4` |
| `option_b` | Second answer choice | ✅ Yes | `To measure investments` |
| `option_c` | Third answer choice | ✅ Yes | `To report cash flows` |
| `option_d` | Fourth answer choice | ✅ Yes | `To calculate taxes` |
| `correct_answer` | The correct option (A, B, C, or D) | ✅ Yes | `A` |
| `explanation` | Explanation shown after exam submission | ✅ Yes | `IFRS 17 was designed to replace IFRS 4...` |

---

## ✅ Rules to Follow

1. **Question Numbers**: Continue sequentially from the last question (currently 14)
   - Next question should be 15, then 16, etc.

2. **Marks**: Only use `1` or `2`
   - Use `1` mark for simpler/factual questions
   - Use `2` marks for more complex/analytical questions

3. **Correct Answer**: Must be exactly `A`, `B`, `C`, or `D` (uppercase)

4. **Text Formatting**:
   - Use single quotes inside text, not double quotes
   - Example: `the 'CSM' represents...` ✅
   - Not: `the "CSM" represents...` ❌
   - If you need to use a comma in text, the CSV cell should be wrapped in quotes

5. **Each question must have exactly 4 options** (A, B, C, D)

6. **Explanations**: 
   - Should explain WHY the correct answer is correct
   - Should be educational and reference IFRS 17 concepts
   - Keep to 1-3 sentences

---

## 📝 Example of Adding New Questions

Here's how to add question 15:

```csv
15,2,"What does LRC stand for in IFRS 17?","Liability for Remaining Claims","Liability for Remaining Coverage","Liability for Reported Claims","Liability for Reinsurance Coverage",B,"LRC stands for Liability for Remaining Coverage, which represents the insurer's obligation to provide coverage for insured events that have not yet occurred."
```

---

## 🎯 Suggested Question Topics

Consider adding questions covering:

### Measurement Models
- General Measurement Model (GMM) details
- Premium Allocation Approach (PAA) eligibility criteria
- Variable Fee Approach (VFA) for participating contracts

### Key Concepts
- Fulfilment Cash Flows (FCF)
- Present Value of Future Cash Flows (PVFCF)
- Discount rates and their application
- Coverage units and CSM amortization

### Financial Statements
- Insurance Revenue recognition
- Insurance Service Result
- Insurance Finance Income/Expense
- OCI option for finance variances

### Transition
- Full retrospective approach
- Modified retrospective approach
- Fair value approach

### Reinsurance
- Reinsurance contract assets
- Loss recovery component
- Timing differences with underlying contracts

### Disclosures
- Required disclosures under IFRS 17
- Reconciliations and roll-forwards
- Sensitivity analysis

---

## 📤 Submitting Your Questions

1. Add your new questions to the CSV file
2. Save the file
3. Notify the development team
4. The team will run the seed script to import questions into the database

---

## 🔢 Current Question Statistics

| Metric | Current Value |
|--------|---------------|
| Total Questions | 14 |
| 1-Mark Questions | 4 |
| 2-Mark Questions | 10 |
| Total Marks | 24 |
| Pass Mark | 60% (15 marks) |

When adding questions, update the exam's total marks accordingly.

---

## ❓ Questions?

Contact the development team if you have any questions about the template format.
