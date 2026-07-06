"use client";

import { useActionState } from "react";
import { signup, AuthState } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const initialState: AuthState = {
  error: undefined,
  success: undefined,
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <motion.form 
      className="flex flex-col gap-5" 
      action={formAction}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
          disabled={isPending}
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
          minLength={8}
          disabled={isPending}
        />
        <p className="text-xs text-[var(--muted)] mt-1">
          Must be at least 8 characters long.
        </p>
      </div>

      {state?.error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-[var(--color-danger)] text-center p-3 bg-[var(--color-danger-light)]/10 border border-[var(--color-danger-light)] rounded-md"
        >
          {state.error}
        </motion.p>
      )}

      <Button
        className="w-full h-11 text-sm font-semibold shadow-sm mt-2"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      
      <p className="text-xs text-center text-[var(--muted)]">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  );
}
