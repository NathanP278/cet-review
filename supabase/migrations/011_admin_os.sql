-- Migration 011: Admin Operating System

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- 100 = Super Admin, 50 = Content Manager, 10 = Moderator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.admin_roles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL, -- e.g., 'users', 'questions', 'flags'
  action TEXT NOT NULL, -- e.g., 'read', 'write', 'delete', 'publish'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, resource, action)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.admin_permissions FOR SELECT USING (true);

-- 2. User Roles Mapping
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One primary admin role per user for MVP
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.user_roles FOR SELECT USING (true);

-- 3. Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
-- Only Super Admins can view audit logs (handled via application logic/Server Actions for now)
CREATE POLICY "Deny direct public read to audit logs" ON public.admin_audit_logs FOR SELECT USING (false);

-- 4. User Reports & Moderation
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'question', 'note'
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);

-- 5. Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.feature_flags FOR SELECT USING (true);

-- 6. Content Versioning Expansion (Alters existing tables)
-- Add status to questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id);

-- Add status to notes
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id);

-- 7. Platform Announcements
CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'event'
  is_active BOOLEAN DEFAULT true,
  target_audience TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for active announcements" ON public.platform_announcements FOR SELECT USING (is_active = true);

-- Insert Default Admin Roles
INSERT INTO public.admin_roles (name, description, level)
VALUES 
  ('Super Admin', 'Full access to all OS features, destructive actions, and user roles.', 100),
  ('Administrator', 'Access to content, users, and reports. Cannot modify roles or audit logs.', 80),
  ('Content Manager', 'Manage and publish subjects, topics, and resources.', 50),
  ('Moderator', 'Review user reports and flag content.', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert default Feature Flags
INSERT INTO public.feature_flags (key, name, description, is_enabled)
VALUES
  ('enable_ai_tutor', 'AI Learning Assistant', 'Enables contextual AI across the platform.', true),
  ('enable_leaderboard', 'Global Leaderboard', 'Shows public leaderboards to students.', true),
  ('enable_seasonal_events', 'Seasonal Events', 'Activates holiday/seasonal UI elements.', false)
ON CONFLICT (key) DO NOTHING;
