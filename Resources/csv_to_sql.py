#!/usr/bin/env python3
"""
IFRS 17 Exam Questions - CSV to SQL Converter

This script reads the IFRS17_Questions_Template.csv file and generates
a SQL migration file that can be run against the Supabase database.

Usage:
    python csv_to_sql.py

Output:
    Creates a new migration file in backend/supabase/migrations/
"""

import csv
import uuid
from datetime import datetime
import os

# Configuration
EXAM_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'  # Existing exam ID
CSV_FILE = 'IFRS17_Questions_Template.csv'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'backend', 'supabase', 'migrations')


def generate_uuid():
    """Generate a UUID for database records."""
    return str(uuid.uuid4())


def escape_sql_string(text):
    """Escape single quotes for SQL."""
    if text is None:
        return ''
    return text.replace("'", "''")


def generate_question_id(question_number):
    """Generate a consistent UUID based on question number."""
    # Use a deterministic format for question IDs
    return f'b1111111-1111-4111-8111-1111111111{question_number:02d}'


def read_csv(filepath):
    """Read questions from CSV file."""
    questions = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            questions.append({
                'question_number': int(row['question_number']),
                'marks': int(row['marks']),
                'question_text': row['question_text'],
                'option_a': row['option_a'],
                'option_b': row['option_b'],
                'option_c': row['option_c'],
                'option_d': row['option_d'],
                'correct_answer': row['correct_answer'].upper(),
                'explanation': row['explanation']
            })
    return questions


def generate_sql(questions):
    """Generate SQL INSERT statements for questions and options."""
    sql_lines = []
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- IFRS 17 Exam Questions - Generated from CSV")
    sql_lines.append(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append(f"-- Total Questions: {len(questions)}")
    sql_lines.append(f"-- Total Marks: {sum(q['marks'] for q in questions)}")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("")
    
    # Calculate new total marks
    total_marks = sum(q['marks'] for q in questions)
    
    sql_lines.append("-- Update exam total marks")
    sql_lines.append(f"UPDATE public.exams SET total_marks = {total_marks} WHERE id = '{EXAM_ID}';")
    sql_lines.append("")
    
    sql_lines.append("-- Delete existing questions and options (cascade will handle options)")
    sql_lines.append(f"DELETE FROM public.questions WHERE exam_id = '{EXAM_ID}';")
    sql_lines.append("")
    
    for q in questions:
        question_id = generate_question_id(q['question_number'])
        
        sql_lines.append(f"-- Question {q['question_number']} ({q['marks']} mark{'s' if q['marks'] > 1 else ''})")
        sql_lines.append(f"""INSERT INTO public.questions (id, exam_id, question_number, prompt, marks, explanation, is_active)
VALUES (
    '{question_id}',
    '{EXAM_ID}',
    {q['question_number']},
    '{escape_sql_string(q['question_text'])}',
    {q['marks']},
    '{escape_sql_string(q['explanation'])}',
    TRUE
);""")
        sql_lines.append("")
        
        # Generate options
        options = [
            ('A', q['option_a']),
            ('B', q['option_b']),
            ('C', q['option_c']),
            ('D', q['option_d'])
        ]
        
        sql_lines.append(f"INSERT INTO public.options (question_id, label, text, is_correct, display_order) VALUES")
        option_values = []
        for i, (label, text) in enumerate(options, 1):
            is_correct = 'TRUE' if label == q['correct_answer'] else 'FALSE'
            option_values.append(f"('{question_id}', '{label}', '{escape_sql_string(text)}', {is_correct}, {i})")
        sql_lines.append(',\n'.join(option_values) + ';')
        sql_lines.append("")
    
    # Verification block
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- VERIFY SEED DATA")
    sql_lines.append("-- ============================================================================")
    sql_lines.append(f"""
DO $$
DECLARE
    v_question_count INTEGER;
    v_option_count INTEGER;
    v_total_marks INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_question_count FROM public.questions WHERE exam_id = '{EXAM_ID}';
    SELECT COUNT(*) INTO v_option_count FROM public.options WHERE question_id IN (
        SELECT id FROM public.questions WHERE exam_id = '{EXAM_ID}'
    );
    SELECT SUM(marks) INTO v_total_marks FROM public.questions WHERE exam_id = '{EXAM_ID}';
    
    RAISE NOTICE 'Seed data verification:';
    RAISE NOTICE '  Questions created: %', v_question_count;
    RAISE NOTICE '  Options created: %', v_option_count;
    RAISE NOTICE '  Total marks: %', v_total_marks;
    
    IF v_question_count != {len(questions)} THEN
        RAISE EXCEPTION 'Expected {len(questions)} questions, found %', v_question_count;
    END IF;
    
    IF v_option_count != {len(questions) * 4} THEN
        RAISE EXCEPTION 'Expected {len(questions) * 4} options, found %', v_option_count;
    END IF;
    
    IF v_total_marks != {total_marks} THEN
        RAISE EXCEPTION 'Expected {total_marks} total marks, found %', v_total_marks;
    END IF;
    
    RAISE NOTICE 'Seed data verification passed!';
END $$;
""")
    
    return '\n'.join(sql_lines)


def main():
    """Main entry point."""
    csv_path = os.path.join(SCRIPT_DIR, CSV_FILE)
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    print(f"Reading questions from {csv_path}...")
    questions = read_csv(csv_path)
    print(f"Found {len(questions)} questions")
    
    print("Generating SQL...")
    sql = generate_sql(questions)
    
    # Generate output filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    output_filename = f"{timestamp}_update_ifrs17_questions.sql"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"SQL migration file created: {output_path}")
    print(f"\nSummary:")
    print(f"  Total Questions: {len(questions)}")
    print(f"  Total Marks: {sum(q['marks'] for q in questions)}")
    print(f"  1-Mark Questions: {sum(1 for q in questions if q['marks'] == 1)}")
    print(f"  2-Mark Questions: {sum(1 for q in questions if q['marks'] == 2)}")
    print(f"\nTo apply this migration, run:")
    print(f"  supabase db push")


if __name__ == '__main__':
    main()
