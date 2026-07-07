import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert, Flag, Activity, Brain } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect all routes under /(admin)
  const { role } = await requireAdmin(10); // Minimum role: Moderator

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Admin Sidebar */}
      <aside className="w-64 flex-col border-r border-[var(--border)] bg-slate-900 text-slate-300 hidden sm:flex">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <ShieldAlert className="h-6 w-6 text-red-500 mr-2" />
          <span className="font-display text-lg font-bold text-white tracking-wide">
            Platform OS
          </span>
        </div>
        <div className="p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Role</div>
          <div className="px-3 py-2 bg-slate-800/50 rounded text-sm text-slate-200 border border-slate-700/50">
            {role.name}
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Activity className="h-4 w-4" /> Analytics
          </Link>

          {role.level >= 50 && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Studio</div>
              <Link href="/admin/studio" className="flex items-center gap-3 px-3 py-2 rounded-md bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 transition-colors border border-purple-500/20">
                <Brain className="h-4 w-4" /> Content Studio
              </Link>
            </>
          )}
          
          {role.level >= 50 && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</div>
              <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                <FileText className="h-4 w-4" /> Subjects & Topics
              </Link>
              <Link href="/admin/questions" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Question Bank
              </Link>
            </>
          )}

          <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Moderation</div>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Flag className="h-4 w-4" /> User Reports
          </Link>

          {role.level >= 80 && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Operations</div>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                <Users className="h-4 w-4" /> User Management
              </Link>
              <Link href="/admin/flags" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="h-4 w-4" /> Feature Flags
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors block text-center">
            &larr; Exit to Student Portal
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin TopBar for mobile / context */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 shadow-sm z-10">
          <div className="font-semibold text-[var(--foreground)]">Administration Workspace</div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
