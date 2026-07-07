"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, PenTool, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subjects", href: "/subjects", icon: Library },
  { name: "Mock Exams", href: "/exam", icon: PenTool },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] sm:flex">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <span className="font-display text-xl font-bold text-[var(--color-primary)]">
          CET Prep
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive ? "text-white" : "text-[var(--muted)]")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
