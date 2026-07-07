-- Migration 012: Academic Intelligence Studio (AIS)

-- 1. AI Generation Tracking
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'gemini', 'openai'
  model TEXT NOT NULL,
  parameters JSONB, -- temperature, tokens, etc.
  output JSONB NOT NULL,
  quality_score INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for admins" ON public.ai_generations FOR SELECT USING (true); -- Protected by app logic

-- 2. Content Version Control
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL, -- 'question', 'note', 'flashcard'
  resource_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  commit_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick history lookup
CREATE INDEX IF NOT EXISTS idx_content_versions_lookup ON public.content_versions(resource_type, resource_id);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for admins" ON public.content_versions FOR SELECT USING (true);

-- 3. Media Resources (YouTube / Documents)
CREATE TABLE IF NOT EXISTS public.media_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'youtube', 'pdf', 'document'
  url TEXT,
  title TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'pending_processing', -- 'pending_processing', 'processed', 'failed'
  transcript TEXT,
  summary TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.media_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.media_resources FOR SELECT USING (true);

-- 4. Expanded Content Schema (If not already present from 011)
-- Extend questions to support AIS workflows
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS quality_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_confidence INTEGER,
ADD COLUMN IF NOT EXISTS human_confidence INTEGER,
ADD COLUMN IF NOT EXISTS generation_id UUID REFERENCES public.ai_generations(id),
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- 5. Content Health Tracking (Materialized View / Table)
-- We use a standard table updated via triggers/cron for MVP performance
CREATE TABLE IF NOT EXISTS public.content_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id),
  topic_id UUID REFERENCES public.topics(id),
  total_questions INTEGER DEFAULT 0,
  draft_questions INTEGER DEFAULT 0,
  published_questions INTEGER DEFAULT 0,
  average_quality_score DECIMAL(5,2),
  duplicate_risk_count INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id)
);

ALTER TABLE public.content_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for admins" ON public.content_health FOR SELECT USING (true);
