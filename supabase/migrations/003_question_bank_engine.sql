-- Migration 003: Question Bank Engine

-- PostgreSQL requires ALTER TYPE ADD VALUE to run outside a transaction block
-- But since Supabase migrations are wrapped in transactions by default,
-- we use a safe block pattern or just allow it if the DB supports it natively in modern PG.
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'challenge';

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS hint TEXT,
ADD COLUMN IF NOT EXISTS estimated_time_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'original',
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50)[] DEFAULT '{}'::VARCHAR[];

-- Add indexes to massively speed up top-level filtering for Subject/Category mock exams
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON questions USING GIN (exam_type);
