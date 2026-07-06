import { createClient } from "@/lib/supabase/server";
import { ReviewClient } from "./ReviewClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("user_cards")
    .select(
      `
      id,
      next_review,
      questions (
        id,
        content,
        answer,
        explanation
      )
    `
    )
    .eq("user_id", user.id)
    .lte("next_review", now)
    .order("next_review", { ascending: true })
    .limit(20);

  return <ReviewClient initialCards={data || []} />;
}
