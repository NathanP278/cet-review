import Link from "next/link";
import { signup } from "@/app/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Create Account
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Join CET Prep to start your journey
        </p>
      </div>

      <form className="flex flex-col gap-5" action={signup}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="email">
            Email Address
          </label>
          <input
            className="flex h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            name="email"
            id="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="password">
            Password
          </label>
          <input
            className="flex h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="keepSignedIn"
            name="keepSignedIn"
            className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="keepSignedIn" className="text-sm text-[var(--muted)]">
            Keep me signed in
          </label>
        </div>

        {message && (
          <p className="text-sm text-[var(--color-danger)] text-center p-3 bg-[var(--color-danger-light)]/10 border border-[var(--color-danger-light)] rounded-md">
            {message}
          </p>
        )}

        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all shadow-sm w-full mt-2"
          type="submit"
        >
          Create Account
        </button>
      </form>

      <div className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
