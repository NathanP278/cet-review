import { Sidebar } from "@/components/domain/Sidebar";
import { TopBar } from "@/components/domain/TopBar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let streak = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak")
      .eq("id", user.id)
      .single();
    if (profile) streak = profile.streak || 0;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar streak={streak} />
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
