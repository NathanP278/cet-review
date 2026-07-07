-- Migration 010: Student Motivation Engine

-- Expand profiles for deeper progression
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS active_title TEXT,
ADD COLUMN IF NOT EXISTS leaderboard_opt_in BOOLEAN DEFAULT false;

-- XP History for audit and anti-spam
CREATE TABLE IF NOT EXISTS public.user_xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own xp history"
  ON public.user_xp_history FOR SELECT
  USING (auth.uid() = user_id);

-- Missions Dictionary
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- e.g., 'flashcard_review', 'quiz_completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.missions FOR SELECT
  USING (true);

-- User Active Missions
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own missions"
  ON public.user_missions FOR SELECT
  USING (auth.uid() = user_id);

-- Insert Default Missions
INSERT INTO public.missions (title, description, mission_type, target_count, xp_reward, action_type)
VALUES 
  ('Daily Warmup', 'Review 10 Flashcards today.', 'daily', 10, 50, 'flashcard_review'),
  ('Quiz Challenger', 'Complete 1 Practice Quiz today.', 'daily', 1, 100, 'quiz_completed'),
  ('Mock Exam Marathon', 'Take a Mock Exam this week.', 'weekly', 1, 500, 'exam_completed')
ON CONFLICT DO NOTHING;
