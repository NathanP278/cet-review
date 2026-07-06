import { createClient } from "@/lib/supabase/server";
import { ExamSessionClient } from "./ExamSessionClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ExamSessionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("questions")
    .select(
      `
      id,
      content,
      answer,
      choices,
      topics (
        id,
        name,
        subjects (
          id,
          name
        )
      )
    `
    )
    .eq("type", "mcq")
    .limit(60);

  return <ExamSessionClient initialQuestions={data || []} />;
}
