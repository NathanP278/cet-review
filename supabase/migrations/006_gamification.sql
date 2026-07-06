-- Migration 006: Gamification Architecture

-- Create achievements dictionary
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can read achievements
CREATE POLICY "Enable read access for all users"
  ON public.achievements FOR SELECT
  USING (true);

-- Create user_achievements mapping
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own achievements
CREATE POLICY "Users can read own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Add gamification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_frozen_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_streak_freeze_used TIMESTAMP WITH TIME ZONE;

-- Insert default achievements
INSERT INTO public.achievements (slug, name, description, points, icon)
VALUES 
  ('first_review', 'First Steps', 'Completed your first flashcard review session.', 10, '🏆'),
  ('100_reviews', 'Centurion Learner', 'Reviewed 100 flashcards.', 50, '💯'),
  ('1000_reviews', 'Knowledge Seeker', 'Reviewed 1,000 flashcards.', 200, '🚀'),
  ('7_day_streak', 'Weekly Warrior', 'Maintained a review streak for 7 consecutive days.', 100, '🔥'),
  ('30_day_streak', 'Monthly Master', 'Maintained a review streak for 30 consecutive days.', 500, '🌟'),
  ('100_mastered', 'Mastermind', 'Successfully mastered 100 concepts.', 300, '🧠'),
  ('perfect_session', 'Flawless Victory', 'Completed a review session with 100% accuracy.', 50, '🎯')
ON CONFLICT (slug) DO NOTHING;
