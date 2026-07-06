export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-display">Dashboard</h1>
      <p className="text-[var(--muted)]">Welcome back! Here is your study plan for today.</p>

      {/* Placeholders for M8 Dashboard components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)]">
          <h2 className="font-semibold mb-2">Exam Readiness</h2>
          <div className="h-32 bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] rounded flex items-center justify-center text-sm text-[var(--muted)]">
            Ring Placeholder
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)]">
          <h2 className="font-semibold mb-2">Today's Study</h2>
          <div className="h-32 bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] rounded flex items-center justify-center text-sm text-[var(--muted)]">
            CTA Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
