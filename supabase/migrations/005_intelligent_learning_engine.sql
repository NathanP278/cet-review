-- Migration 005: Intelligent Learning & Retention Engine

-- 1. Create Card State Enum
CREATE TYPE card_state AS ENUM ('new', 'learning', 'review', 'relearning', 'suspended', 'buried');

-- 2. Update Profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_review_limit INTEGER DEFAULT 50;

-- 3. Upgrade user_cards for deeper SM-2/Anki logic
-- We will preserve existing interval, ease_factor, repetitions, but add new fields
ALTER TABLE user_cards
ADD COLUMN IF NOT EXISTS state card_state DEFAULT 'new' NOT NULL,
ADD COLUMN IF NOT EXISTS last_review TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lapse_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS average_response_time REAL DEFAULT 0.0 NOT NULL,
ADD COLUMN IF NOT EXISTS retention_score REAL DEFAULT 0.0 NOT NULL,
ADD COLUMN IF NOT EXISTS mastery_score REAL DEFAULT 0.0 NOT NULL;

-- 4. Create Review History Table
CREATE TABLE review_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    rating VARCHAR(10) NOT NULL, -- 'again', 'hard', 'good', 'easy'
    response_time_seconds REAL NOT NULL,
    interval_days INTEGER NOT NULL,
    ease_factor REAL NOT NULL
);

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_review_history_user_date ON review_history(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_user_cards_state ON user_cards(user_id, state);
CREATE INDEX IF NOT EXISTS idx_user_cards_lapses ON user_cards(user_id, lapse_count);

-- 6. Enable RLS on review_history
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own review history" 
ON review_history FOR ALL 
USING (auth.uid() = user_id);
