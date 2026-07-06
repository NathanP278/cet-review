import { Sidebar } from "@/components/domain/Sidebar";
import { TopBar } from "@/components/domain/TopBar";
import { getProfile } from "@/lib/auth";
import { SessionManager } from "@/components/domain/SessionManager";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const streak = profile?.streak || 0;

  const cookieStore = await cookies();
  const keepSignedIn = cookieStore.get("keep_signed_in")?.value === "true";

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <SessionManager keepSignedIn={keepSignedIn} />
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
