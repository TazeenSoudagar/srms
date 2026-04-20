"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Calendar, User, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "My Requests", icon: ClipboardList },
  { href: "/schedules", label: "Schedules", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            SE
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">SRMS Engineer</p>
            <p className="text-xs text-neutral-400 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname === href || pathname.startsWith(`${href}/`)
                ? "bg-primary-600 text-white"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-700">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-neutral-400">Support Engineer</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
