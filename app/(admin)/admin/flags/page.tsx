import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { Settings, Check, X, ShieldAlert } from "lucide-react";

export default async function AdminFlagsPage() {
  const { supabase, role } = await requireAdmin(80); // Minimum: Administrator

  const { data: flags } = await supabase.from("feature_flags").select("*").order("name");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Feature Flags</h1>
        <p className="text-slate-500 text-sm mt-1">Safely enable or disable platform modules in real-time.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Warning:</strong> Modifying feature flags takes effect immediately across all active user sessions. 
          Disable features cautiously.
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {flags?.map((flag) => (
          <div key={flag.id} className="p-6 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">{flag.name}</h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {flag.key}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{flag.description}</p>
            </div>
            
            {/* MVP Toggle visual */}
            <button 
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                flag.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={flag.is_enabled}
            >
              <span className="sr-only">Toggle feature</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  flag.is_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {flag.is_enabled ? (
                  <Check className="h-3 w-3 m-1 text-emerald-500" />
                ) : (
                  <X className="h-3 w-3 m-1 text-slate-400" />
                )}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
