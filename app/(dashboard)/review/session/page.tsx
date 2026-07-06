import { ReviewClient } from "./ReviewClient";
import { redirect } from "next/navigation";
import { getDailyReviewQueue } from "@/app/actions/sm2";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReviewSessionPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch intelligent queue
  const data = await getDailyReviewQueue();

  return <ReviewClient initialCards={data || []} />;
}
