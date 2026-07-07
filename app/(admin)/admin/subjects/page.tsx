import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { Library, Plus, GripVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminSubjectsPage() {
  const { supabase } = await requireAdmin(50); // Minimum: Content Manager

  // Fetch subjects and their topics
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, topics(*)")
    .order("id", { ascending: true });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Subject Architecture</h1>
          <p className="text-slate-500 text-sm mt-1">Manage learning paths and content hierarchies.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      <div className="space-y-6">
        {subjects?.map((subject) => (
          <div key={subject.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${subject.color}20` }}>
                  {subject.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                  <div className="text-xs text-slate-500">{subject.topics?.length || 0} topics registered</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                <Settings className="h-4 w-4" /> Configure
              </Button>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {subject.topics?.map((topic: any) => (
                    <tr key={topic.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="pl-14 pr-6 py-3 font-medium text-slate-700 dark:text-slate-300 w-1/3">
                        {topic.name}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 w-1/3">
                        {topic.difficulty} difficulty
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          Edit Topic
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <td colSpan={3} className="px-14 py-3">
                      <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white gap-2 h-7">
                        <Plus className="h-3 w-3" /> Add Topic
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
