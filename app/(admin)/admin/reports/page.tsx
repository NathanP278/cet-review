import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { Flag, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin(10); // Minimum: Moderator

  // Fetch pending reports
  const { data: reports } = await supabase
    .from("user_reports")
    .select("*, reporter:reporter_id(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Moderation Queue</h1>
        <p className="text-slate-500 text-sm mt-1">Review student reports for incorrect questions and typos.</p>
      </div>

      <div className="grid gap-4">
        {reports?.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row">
            <div className={`w-2 h-full min-h-[8px] ${report.status === 'pending' ? 'bg-amber-500' : report.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            <div className="p-5 flex-1 flex flex-col sm:flex-row justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                    ${report.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                      report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {report.resource_type}
                  </span>
                  <span className="text-xs text-slate-400">
                    Reported by {(report.reporter as any)?.name || 'Anonymous'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{report.reason}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {report.description || "No additional description provided."}
                  </p>
                </div>
                
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(report.created_at || Date.now()).toLocaleString()}
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 justify-end">
                {report.status === 'pending' && (
                  <>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                      <CheckCircle className="h-4 w-4" /> Resolve
                    </Button>
                    <Button size="sm" variant="outline" className="text-slate-600 dark:text-slate-300 gap-2">
                      <Flag className="h-4 w-4" /> View Resource
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-500 gap-2">
                      <XCircle className="h-4 w-4" /> Dismiss
                    </Button>
                  </>
                )}
                {report.status !== 'pending' && (
                  <div className="text-sm font-medium text-slate-400 flex items-center gap-1">
                    {report.status === 'resolved' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-500" />}
                    Closed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!reports || reports.length === 0) && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Inbox Zero</h3>
            <p className="mt-1">There are no pending reports in the moderation queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
