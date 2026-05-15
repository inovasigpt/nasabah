"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Ticket, Lock, Activity } from "lucide-react";

interface TopBarProps {
  userName?: string;
  userRole?: string;
}

export default function TopBar({ userName, userRole }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Fraud Today", value: 3, icon: AlertTriangle, color: "text-status-danger" },
    { label: "Open Complaints", value: 8, icon: Ticket, color: "text-status-warning" },
    { label: "Frozen Accounts", value: 1, icon: Lock, color: "text-bi-navy" },
    { label: "System Status", value: "Active", icon: Activity, color: "text-status-safe" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Ticker Stats */}
        <div className="flex items-center gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <span className="text-sm font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* User & Time */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userName || "Guest"}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole?.toLowerCase() || "unknown"}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="text-right">
            <p className="text-sm font-mono font-medium text-bi-navy">
              {currentTime.toLocaleTimeString("en-US", { hour12: false })}
            </p>
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
