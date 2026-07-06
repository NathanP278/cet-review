import Link from "next/link";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2">
          Enter your email to sign in to your account
        </p>
      </div>

      <form className="flex flex-col gap-4" action={login}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            name="email"
            id="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            required
          />
        </div>

        {message && (
          <p className="text-sm text-[var(--color-danger)] text-center p-2 bg-[var(--color-danger-light)]/10 rounded-md">
            {message}
          </p>
        )}

        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors mt-2"
          type="submit"
        >
          Sign In
        </button>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="underline text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
