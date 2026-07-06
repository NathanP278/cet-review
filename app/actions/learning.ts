/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserNote(topicId: string, subtopicId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase.from("user_notes").select("*").eq("user_id", user.id).limit(1);
  if (subtopicId) {
    query = query.eq("subtopic_id", subtopicId);
  } else {
    query = query.eq("topic_id", topicId);
  }

  const { data, error } = await query.single();
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching note:", error);
  }
  return data;
}

export async function saveUserNote(topicId: string, content: string, subtopicId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await getUserNote(topicId, subtopicId);

  if (existing) {
    const { error } = await supabase
      .from("user_notes")
      .update({ content })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("user_notes").insert({
      user_id: user.id,
      topic_id: subtopicId ? null : topicId,
      subtopic_id: subtopicId || null,
      content,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/learn/${topicId}`);
}

export async function getBookmarks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleBookmark(
  entityType: "topic" | "subtopic" | "resource" | "video" | "formula",
  entityId: string | null,
  itemRef?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("entity_type", entityType);
  
  if (entityId) query = query.eq("entity_id", entityId);
  else query = query.is("entity_id", null);

  if (itemRef) query = query.eq("item_ref", itemRef);
  else query = query.is("item_ref", null);

  const { data } = await query.limit(1).single();

  if (data) {
    // Exists, so un-bookmark
    await supabase.from("bookmarks").delete().eq("id", data.id);
  } else {
    // Does not exist, create
    await supabase.from("bookmarks").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId || null,
      item_ref: itemRef || null,
    });
  }

  revalidatePath("/bookmarks");
}

export async function getProgress(topicId: string, subtopicId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase.from("user_progress").select("*").eq("user_id", user.id).limit(1);
  if (subtopicId) query = query.eq("subtopic_id", subtopicId);
  else query = query.eq("topic_id", topicId);

  const { data, error } = await query.single();
  if (error && error.code !== "PGRST116") console.error("Error fetching progress:", error);
  return data;
}

export async function updateProgress(
  topicId: string,
  status?: "started" | "completed",
  addStudyTimeSeconds?: number,
  subtopicId?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const existing = await getProgress(topicId, subtopicId);

  if (existing) {
    const updates: any = {};
    if (status) updates.status = status;
    if (addStudyTimeSeconds) {
      updates.study_time_seconds = (existing.study_time_seconds || 0) + addStudyTimeSeconds;
    }
    await supabase.from("user_progress").update(updates).eq("id", existing.id);
  } else {
    await supabase.from("user_progress").insert({
      user_id: user.id,
      topic_id: subtopicId ? null : topicId,
      subtopic_id: subtopicId || null,
      status: status || "started",
      study_time_seconds: addStudyTimeSeconds || 0,
    });
  }
}

export async function searchContent(query: string) {
  const supabase = await createClient();
  
  // A naive implementation for MVP: ilike across topics
  // In a real app with large data, you would use Postgres Full Text Search (to_tsvector)
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, description, category_id, categories(subject_id)")
    .ilike("name", `%${query}%`)
    .limit(10);

  const { data: notes } = await supabase
    .from("user_notes")
    .select("id, topic_id, content")
    .ilike("content", `%${query}%`)
    .limit(10);

  return { topics: topics || [], notes: notes || [] };
}
