-- 1. Add Version Tracking for Optimistic Locking
ALTER TABLE mock_exam_attempts
  ADD COLUMN version INT DEFAULT 1;

-- 2. Add Scalable Randomization Weight
ALTER TABLE questions
  ADD COLUMN random_weight FLOAT DEFAULT random();

-- Backfill existing questions
UPDATE questions SET random_weight = random() WHERE random_weight IS NULL;

-- Create an index to support fast scalable random fetches
CREATE INDEX idx_questions_random_weight ON questions(topic_id, difficulty, random_weight);

-- 3. Atomic JSONB Update RPC with Optimistic Locking
CREATE OR REPLACE FUNCTION update_exam_state(
  p_attempt_id UUID,
  p_user_id UUID,
  p_expected_version INT,
  p_new_answers JSONB,
  p_new_flagged JSONB,
  p_new_time_per_question JSONB,
  p_remaining_seconds INT
) RETURNS INT AS $$
DECLARE
  v_current_version INT;
  v_current_state JSONB;
BEGIN
  -- Lock the row for update
  SELECT version, state INTO v_current_version, v_current_state
  FROM mock_exam_attempts
  WHERE id = p_attempt_id AND user_id = p_user_id AND status = 'in_progress'
  FOR UPDATE;

  -- Not found or not in progress
  IF NOT FOUND THEN 
    RETURN 0; 
  END IF;
  
  -- Optimistic locking conflict
  IF v_current_version != p_expected_version THEN
    RETURN -1;
  END IF;

  -- Build the new state atomically
  v_current_state := jsonb_set(v_current_state, '{answers}', p_new_answers);
  v_current_state := jsonb_set(v_current_state, '{flagged}', p_new_flagged);
  v_current_state := jsonb_set(v_current_state, '{timePerQuestion}', p_new_time_per_question);
  v_current_state := jsonb_set(v_current_state, '{remainingSeconds}', to_jsonb(p_remaining_seconds));

  UPDATE mock_exam_attempts
  SET 
    state = v_current_state,
    version = version + 1
  WHERE id = p_attempt_id;

  RETURN v_current_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Scalable Randomization RPC
CREATE OR REPLACE FUNCTION get_scalable_random_questions(
  p_limit INT,
  p_subject_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_topic_id UUID DEFAULT NULL,
  p_difficulty difficulty_level DEFAULT NULL,
  p_seed FLOAT DEFAULT random()
) RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    (
      SELECT q.* FROM questions q
      JOIN topics t ON q.topic_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE (p_subject_id IS NULL OR c.subject_id = p_subject_id)
        AND (p_category_id IS NULL OR t.category_id = p_category_id)
        AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
        AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
        AND q.random_weight >= p_seed
      ORDER BY q.random_weight ASC
      LIMIT p_limit
    )
    UNION ALL
    (
      SELECT q.* FROM questions q
      JOIN topics t ON q.topic_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE (p_subject_id IS NULL OR c.subject_id = p_subject_id)
        AND (p_category_id IS NULL OR t.category_id = p_category_id)
        AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
        AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
        AND q.random_weight < p_seed
      ORDER BY q.random_weight ASC
      LIMIT p_limit
    )
  ) combined
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Analytics Views
-- Overall study stats view
CREATE OR REPLACE VIEW user_study_stats_view AS
SELECT 
  u.id as user_id,
  COALESCE(q.total_quizzes, 0) as total_quizzes,
  COALESCE(e.total_exams, 0) as total_exams,
  COALESCE(r.total_reviews, 0) as total_reviews,
  COALESCE(r.total_time_seconds, 0) as total_study_time_seconds
FROM auth.users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_quizzes FROM quiz_attempts GROUP BY user_id
) q ON u.id = q.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_exams FROM mock_exam_attempts WHERE status = 'completed' GROUP BY user_id
) e ON u.id = e.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_reviews, SUM(response_time_seconds) as total_time_seconds FROM review_history GROUP BY user_id
) r ON u.id = r.user_id;

-- Subject Mastery View
CREATE OR REPLACE VIEW subject_mastery_analytics_view AS
SELECT 
  uc.user_id,
  c.subject_id,
  s.name as subject_name,
  COUNT(*) as total_cards,
  SUM(CASE WHEN uc.state = 'review' THEN 1 ELSE 0 END) as mastered_cards,
  AVG(uc.retention_score) as avg_retention
FROM user_cards uc
JOIN questions q ON uc.question_id = q.id
JOIN topics t ON q.topic_id = t.id
JOIN categories c ON t.category_id = c.id
JOIN subjects s ON c.subject_id = s.id
GROUP BY uc.user_id, c.subject_id, s.name;
