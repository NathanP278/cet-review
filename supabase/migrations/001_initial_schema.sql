DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
-- Create ENUM for Question Types
CREATE TYPE question_type AS ENUM ('mcq', 'flashcard');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Topics Table
CREATE TABLE topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subtopics Table
CREATE TABLE subtopics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Topic Resources (Flexible Content System)
CREATE TABLE topic_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE CASCADE,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    study_notes TEXT,
    key_concepts JSONB DEFAULT '[]'::jsonb,
    formulas JSONB DEFAULT '[]'::jsonb,
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    external_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (topic_id IS NOT NULL AND subtopic_id IS NULL) OR 
        (topic_id IS NULL AND subtopic_id IS NOT NULL)
    )
);

-- 7. Questions Table
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    difficulty difficulty_level DEFAULT 'medium',
    content TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    choices JSONB, -- Array of strings for MCQ
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (topic_id IS NOT NULL AND subtopic_id IS NULL) OR 
        (topic_id IS NULL AND subtopic_id IS NOT NULL) OR
        (topic_id IS NOT NULL AND subtopic_id IS NOT NULL)
    )
);

-- 8. UserCards (SM-2 State)
CREATE TABLE user_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    interval INTEGER DEFAULT 0 NOT NULL,
    ease_factor REAL DEFAULT 2.5 NOT NULL,
    next_review TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    repetitions INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Index for fast daily review fetching
CREATE INDEX idx_user_cards_user_next_review ON user_cards(user_id, next_review);
CREATE INDEX idx_questions_subtopic ON questions(subtopic_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);

-- 9. Quiz Attempts
CREATE TABLE quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Mock Exam Attempts
CREATE TABLE mock_exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    score_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

CREATE TRIGGER update_user_cards_updated_at
BEFORE UPDATE ON user_cards
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

CREATE TRIGGER update_topic_resources_updated_at
BEFORE UPDATE ON topic_resources
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Public Content (Read Only for Authenticated)
CREATE POLICY "Authenticated users can read subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read topics" ON topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read subtopics" ON subtopics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read topic_resources" ON topic_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT TO authenticated USING (true);

-- UserCards: Users can fully manage their own cards
CREATE POLICY "Users can manage own cards" ON user_cards FOR ALL USING (auth.uid() = user_id);

-- QuizAttempts: Users can insert and read their own attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

-- MockExamAttempts: Users can insert and read their own attempts
CREATE POLICY "Users can insert own mock exam attempts" ON mock_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own mock exam attempts" ON mock_exam_attempts FOR SELECT USING (auth.uid() = user_id);

-- Trigger to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
