-- Migration 007: S3 Stabilization

-- 1. Detailed Quiz History
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS details JSONB;

-- 2. Topic Mastery View
-- Calculates real mastery based on user_cards state. 'review' state indicates the card is mastered (not new/learning/relearning).
CREATE OR REPLACE VIEW topic_mastery_view AS
SELECT 
    uc.user_id,
    COALESCE(q.topic_id, st.topic_id) AS topic_id,
    COUNT(uc.id) AS total_cards,
    COUNT(uc.id) FILTER (WHERE uc.state = 'review') AS mastered_cards,
    COALESCE(AVG(uc.retention_score), 0) AS avg_retention,
    COALESCE((COUNT(uc.id) FILTER (WHERE uc.state = 'review')::float / NULLIF(COUNT(uc.id), 0)) * 100, 0) AS mastery_percentage
FROM user_cards uc
JOIN questions q ON uc.question_id = q.id
LEFT JOIN subtopics st ON q.subtopic_id = st.id
WHERE COALESCE(q.topic_id, st.topic_id) IS NOT NULL
GROUP BY uc.user_id, COALESCE(q.topic_id, st.topic_id);

-- 3. Subject Mastery View
CREATE OR REPLACE VIEW subject_mastery_view AS
SELECT 
    uc.user_id,
    c.subject_id,
    COUNT(uc.id) AS total_cards,
    COUNT(uc.id) FILTER (WHERE uc.state = 'review') AS mastered_cards,
    COALESCE(AVG(uc.retention_score), 0) AS avg_retention,
    COALESCE((COUNT(uc.id) FILTER (WHERE uc.state = 'review')::float / NULLIF(COUNT(uc.id), 0)) * 100, 0) AS mastery_percentage
FROM user_cards uc
JOIN questions q ON uc.question_id = q.id
LEFT JOIN subtopics st ON q.subtopic_id = st.id
JOIN topics t ON COALESCE(q.topic_id, st.topic_id) = t.id
JOIN categories c ON t.category_id = c.id
WHERE c.subject_id IS NOT NULL
GROUP BY uc.user_id, c.subject_id;
