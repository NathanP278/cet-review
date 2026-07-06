"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Shield, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-[var(--muted)] mt-2">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings (Visual Only for MVP) */}
        <div className="col-span-1 flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start gap-3 border-[var(--color-primary)] bg-[var(--color-primary-light)]/10 text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
          >
            <User className="h-4 w-4" /> Account
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="justify-start gap-3">
            <Shield className="h-4 w-4" /> Privacy & Security
          </Button>
        </div>

        {/* Main Settings Content */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details and login credentials.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--muted)]">Email Address</label>
                <div className="px-4 py-2 bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] border border-[var(--border)] rounded-md font-medium">
                  {email || "Unknown"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[var(--muted)]">Password</label>
                <Button variant="outline" className="w-fit">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Customize your learning experience.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <h4 className="font-medium">Daily Reminders</h4>
                  <p className="text-sm text-[var(--muted)]">
                    Get notified when you have cards due for review.
                  </p>
                </div>
                <div className="w-12 h-6 bg-[var(--color-primary)] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <Button
              variant="danger"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="gap-2"
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
