import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export const getCachedSubjects = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("subjects").select("*").order("name");
    return data || [];
  },
  ["curriculum-subjects"],
  { revalidate: 3600, tags: ["subjects"] }
);

export const getCachedCategories = unstable_cache(
  async (subjectId?: string) => {
    const supabase = await createClient();
    let query = supabase.from("categories").select("*").order("order_index");
    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }
    const { data } = await query;
    return data || [];
  },
  ["curriculum-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedTopics = unstable_cache(
  async (categoryId?: string) => {
    const supabase = await createClient();
    let query = supabase.from("topics").select("*").order("order_index");
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    const { data } = await query;
    return data || [];
  },
  ["curriculum-topics"],
  { revalidate: 3600, tags: ["topics"] }
);
