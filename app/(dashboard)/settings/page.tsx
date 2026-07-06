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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data);
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

  const updatePreference = async (key: string, value: any) => {
    if (!profile) return;
    setSaving(true);
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("profiles").update({ [key]: value } as any).eq("id", profile.id);
    setSaving(false);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cet_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export data");
    }
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Study Preferences
                {saving && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />}
              </CardTitle>
              <CardDescription>Customize your learning experience.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <h4 className="font-medium">Daily Review Limit</h4>
                  <p className="text-sm text-[var(--muted)]">Maximum cards to review per day.</p>
                </div>
                <input 
                  type="number" 
                  className="w-20 px-3 py-1 border border-[var(--border)] rounded bg-transparent"
                  value={profile?.daily_review_limit || 50}
                  onChange={(e) => updatePreference("daily_review_limit", parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <h4 className="font-medium">Review Animations</h4>
                  <p className="text-sm text-[var(--muted)]">Enable 3D flip and swipe animations.</p>
                </div>
                <button 
                  onClick={() => updatePreference("review_animations", !profile?.review_animations)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${profile?.review_animations ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-slate-300)] dark:bg-[var(--color-slate-700)]'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${profile?.review_animations ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <h4 className="font-medium">Keyboard Shortcuts</h4>
                  <p className="text-sm text-[var(--muted)]">Use Space and 1-4 for quick ratings.</p>
                </div>
                <button 
                  onClick={() => updatePreference("keyboard_shortcuts", !profile?.keyboard_shortcuts)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${profile?.keyboard_shortcuts ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-slate-300)] dark:bg-[var(--color-slate-700)]'}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${profile?.keyboard_shortcuts ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your study data.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-[var(--muted)]">Download your review history in JSON format.</p>
                </div>
                <Button variant="outline" onClick={handleExport}>Export JSON</Button>
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
