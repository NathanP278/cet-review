export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight text-[var(--color-primary)]">
            UPCAT Prep
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
