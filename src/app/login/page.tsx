"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, Ticket, Lock } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) router.push("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-bi-navy">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-bi-navy rounded-full">
              <Shield className="w-8 h-8 text-bi-gold" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-bi-navy">Nasabah System</h1>
          <p className="text-gray-500 text-sm">Fraud Detection & Complaint Management</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bi-navy focus:border-bi-navy outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bi-navy focus:border-bi-navy outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-bi-navy hover:bg-blue-900 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 mb-2">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded text-center">
              <span className="font-medium text-bi-navy">admin</span>
              <span className="block text-gray-400">admin</span>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <span className="font-medium text-bi-navy">analyst</span>
              <span className="block text-gray-400">analyst</span>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <span className="font-medium text-bi-navy">investigator</span>
              <span className="block text-gray-400">investigator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
