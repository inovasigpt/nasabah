"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  BrainCircuit,
  ShieldAlert,
  ClipboardList,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Complaints", href: "/complaints", icon: Inbox },
  { name: "Investigation", href: "/investigation", icon: GitBranch },
  { name: "AI Rules", href: "/rules", icon: BrainCircuit },
  { name: "Security", href: "/security", icon: ShieldAlert },
  { name: "Audit Trail", href: "/audit", icon: ClipboardList },
];

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter((item) => {
    if (userRole === "ANALYST") {
      return !["/rules", "/security"].includes(item.href);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-bi-navy text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bi-gold rounded-lg">
            <ShieldAlert className="w-6 h-6 text-bi-navy" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">NASABAH</h1>
            <p className="text-xs text-blue-200">Fraud & Complaint System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-bi-gold text-bi-navy"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
