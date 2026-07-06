import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all user data
  const [
    { data: reviewHistory },
    { data: userCards },
    { data: userNotes },
    { data: profile }
  ] = await Promise.all([
    supabase.from("review_history").select("*").eq("user_id", user.id),
    supabase.from("user_cards").select("*").eq("user_id", user.id),
    supabase.from("user_notes").select("*").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).single()
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    profile,
    userCards,
    reviewHistory,
    userNotes
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cet_export_${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
