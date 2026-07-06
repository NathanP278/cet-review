import { createClient } from "@/lib/supabase/server";
import { ReviewClient } from "./ReviewClient";
import { redirect } from "next/navigation";
import { getDailyReviewQueue } from "@/app/actions/sm2";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch intelligent queue
  const data = await getDailyReviewQueue();

  return <ReviewClient initialCards={data || []} />;
}
