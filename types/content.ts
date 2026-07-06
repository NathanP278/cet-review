export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Topic {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface TopicResource {
  id: string;
  topic_id: string | null;
  subtopic_id: string | null; // Can belong to a topic or a specific subtopic
  learning_objectives: string[];
  study_notes: string | null;
  key_concepts: { term: string; definition: string }[];
  formulas: { name: string; formula: string; explanation?: string }[];
  common_mistakes: string[];
  videos: { title: string; url: string; duration?: string }[];
  external_links: { title: string; url: string; description?: string }[];
  created_at: string;
  updated_at: string;
}

export type QuestionType = "mcq" | "flashcard";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  subtopic_id: string | null; // Usually linked to subtopic, but could fall back to topic_id
  topic_id: string | null;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  answer: string;
  explanation: string | null;
  choices: string[] | null; // For MCQ
  tags: string[];
  created_at: string;
}
