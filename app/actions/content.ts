"use server";

import { createClient } from "@/lib/supabase/server";
import { Subject, Category, Topic, Subtopic, TopicResource, Question } from "@/types/content";

export type CompleteCurriculum = Subject & {
  categories: (Category & {
    topics: (Topic & {
      subtopics: Subtopic[];
    })[];
  })[];
};

/**
 * Fetches the complete multi-tiered curriculum hierarchy.
 */
export async function getCompleteCurriculum(): Promise<CompleteCurriculum[]> {
  const supabase = await createClient();

  // In a massive application, you would normally cache this at the edge or Redis.
  // For Supabase, we can use an RPC function to build the nested JSON, or fetch flat and assemble.
  // For the MVP with Server Actions, we'll fetch flat and assemble in memory.
  
  const [subjectsRes, categoriesRes, topicsRes, subtopicsRes] = await Promise.all([
    supabase.from("subjects").select("*").order("name"),
    supabase.from("categories").select("*").order("order_index"),
    supabase.from("topics").select("*").order("order_index"),
    supabase.from("subtopics").select("*").order("order_index"),
  ]);

  if (subjectsRes.error) throw new Error(subjectsRes.error.message);
  
  const subjects = subjectsRes.data as Subject[];
  const categories = categoriesRes.data as Category[] || [];
  const topics = topicsRes.data as Topic[] || [];
  const subtopics = subtopicsRes.data as Subtopic[] || [];

  return subjects.map((subject) => ({
    ...subject,
    categories: categories
      .filter((c) => c.subject_id === subject.id)
      .map((category) => ({
        ...category,
        topics: topics
          .filter((t) => t.category_id === category.id)
          .map((topic) => ({
            ...topic,
            subtopics: subtopics.filter((st) => st.topic_id === topic.id),
          })),
      })),
  }));
}

/**
 * Fetches the specific resource payload for a topic or subtopic.
 */
export async function getTopicContent(
  topicId?: string,
  subtopicId?: string
): Promise<TopicResource | null> {
  const supabase = await createClient();

  let query = supabase.from("topic_resources").select("*").limit(1);

  if (subtopicId) {
    query = query.eq("subtopic_id", subtopicId);
  } else if (topicId) {
    query = query.eq("topic_id", topicId);
  } else {
    throw new Error("Must provide either topicId or subtopicId");
  }

  const { data, error } = await query.single();

  // It's perfectly valid for a topic/subtopic to not have expanded content yet
  if (error && error.code === 'PGRST116') return null; 
  if (error) throw new Error(error.message);

  return data as TopicResource;
}

/**
 * Fetches practice questions, randomized, for a specific subtopic or topic.
 */
export async function getPracticeQuestions(
  options: { topicId?: string; subtopicId?: string; limit?: number; type?: "mcq" | "flashcard" }
): Promise<Question[]> {
  const supabase = await createClient();

  let query = supabase.from("questions").select("*");

  if (options.subtopicId) {
    query = query.eq("subtopic_id", options.subtopicId);
  } else if (options.topicId) {
    query = query.eq("topic_id", options.topicId);
  }

  if (options.type) {
    query = query.eq("type", options.type);
  }

  // To fetch randomly we use the random() Postgres function, or simple JS shuffle for MVP scale
  const { data, error } = await query.limit(options.limit || 10);

  if (error) throw new Error(error.message);

  // Shuffle in JS (since Supabase select doesn't have a built in random() without RPC)
  const questions = data as Question[];
  return questions.sort(() => Math.random() - 0.5);
}
