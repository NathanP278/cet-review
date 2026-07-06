"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const keepSignedIn = formData.get("keepSignedIn") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient(keepSignedIn ? {} : { maxAge: 7200 });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message || "Invalid email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("keep_signed_in", keepSignedIn ? "true" : "false", { 
    maxAge: keepSignedIn ? 31536000 : 7200 
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const keepSignedIn = formData.get("keepSignedIn") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient(keepSignedIn ? {} : { maxAge: 7200 });
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message || "Could not create account." };
  }

  const cookieStore = await cookies();
  cookieStore.set("keep_signed_in", keepSignedIn ? "true" : "false", { 
    maxAge: keepSignedIn ? 31536000 : 7200 
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  const cookieStore = await cookies();
  cookieStore.delete("keep_signed_in");
  
  redirect("/login");
}
