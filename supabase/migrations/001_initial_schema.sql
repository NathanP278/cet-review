-- Create ENUM for Question Types
CREATE TYPE question_type AS ENUM ('mcq', 'flashcard');

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topics Table
CREATE TABLE topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Questions Table
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
    type question_type NOT NULL,
    content TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    choices JSONB, -- Array of strings for MCQ
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. UserCards (SM-2 State)
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

-- 6. Quiz Attempts
CREATE TABLE quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Mock Exam Attempts
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

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subjects, Topics, Questions: Anyone authenticated can read
CREATE POLICY "Authenticated users can read subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read topics" ON topics FOR SELECT TO authenticated USING (true);
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
