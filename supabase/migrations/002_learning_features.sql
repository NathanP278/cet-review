-- 002_learning_features.sql
-- Add user_notes, bookmarks, and user_progress for M16

CREATE TYPE bookmark_entity_type AS ENUM ('topic', 'subtopic', 'resource', 'video', 'formula');
CREATE TYPE progress_status AS ENUM ('started', 'completed');

-- 1. User Notes
CREATE TABLE user_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (topic_id IS NOT NULL AND subtopic_id IS NULL) OR 
        (topic_id IS NULL AND subtopic_id IS NOT NULL) OR
        (topic_id IS NOT NULL AND subtopic_id IS NOT NULL)
    ),
    UNIQUE(user_id, topic_id, subtopic_id)
);

-- 2. Bookmarks
CREATE TABLE bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    entity_type bookmark_entity_type NOT NULL,
    entity_id UUID, -- If it's a direct reference to a table row
    item_ref TEXT, -- If it's a reference to a JSON sub-item (e.g., video URL or formula name)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id, item_ref)
);

-- 3. User Progress
CREATE TABLE user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE CASCADE,
    status progress_status DEFAULT 'started',
    study_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (topic_id IS NOT NULL AND subtopic_id IS NULL) OR 
        (topic_id IS NULL AND subtopic_id IS NOT NULL) OR
        (topic_id IS NOT NULL AND subtopic_id IS NOT NULL)
    ),
    UNIQUE(user_id, topic_id, subtopic_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_user_notes_updated_at
BEFORE UPDATE ON user_notes
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- RLS
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" ON user_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
