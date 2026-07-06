import Link from "next/link";
import { LoginForm } from "@/components/domain/LoginForm";

export default function LoginPage() {

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Welcome Back
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Sign in to your CET Prep account
        </p>
      </div>

      <LoginForm />

      <div className="text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          Create one now
        </Link>
      </div>
    </div>
  );
}
