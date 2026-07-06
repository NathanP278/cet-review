import Link from "next/link";
import { SignupForm } from "@/components/domain/SignupForm";

export default function SignupPage() {
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

      <SignupForm />

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
