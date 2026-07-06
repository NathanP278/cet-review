import { createClient } from "@/lib/supabase/server";
import { PracticeClient } from "./PracticeClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase.from("questions").select("*").eq("type", "mcq").limit(5);

  return <PracticeClient initialQuestions={data || []} />;
}
