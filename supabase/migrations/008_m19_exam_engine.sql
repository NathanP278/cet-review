-- 1. Create Exam Status Enum
CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- 2. Alter Mock Exam Attempts Table
ALTER TABLE mock_exam_attempts
  ADD COLUMN status exam_status DEFAULT 'in_progress',
  ADD COLUMN config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN state JSONB DEFAULT '{}'::jsonb,
  ALTER COLUMN score_data DROP NOT NULL; -- Allows us to create it before grading

-- 3. Review Queue Performance Index
CREATE INDEX IF NOT EXISTS idx_user_cards_queue 
  ON user_cards(user_id, state, lapse_count DESC, next_review ASC);

-- 4. Secure Random Question Fetcher (RPC)
-- This function fetches questions efficiently using TABLESAMPLE if needed, or ORDER BY random() for filtered sets
CREATE OR REPLACE FUNCTION get_randomized_questions(
  p_limit INT,
  p_subject_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_topic_id UUID DEFAULT NULL,
  p_difficulty difficulty_level DEFAULT NULL
) 
RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM questions
  WHERE 
    (p_subject_id IS NULL OR id IN (
        SELECT q.id FROM questions q
        JOIN topics t ON q.topic_id = t.id
        JOIN categories c ON t.category_id = c.id
        WHERE c.subject_id = p_subject_id
    ))
    AND (p_category_id IS NULL OR id IN (
        SELECT q.id FROM questions q
        JOIN topics t ON q.topic_id = t.id
        WHERE t.category_id = p_category_id
    ))
    AND (p_topic_id IS NULL OR topic_id = p_topic_id)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
