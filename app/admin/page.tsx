"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid password. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1016] px-6">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full max-w-sm">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#e7dfc6]/40 via-sky-300/20 to-transparent" />

        <div className="rounded-[28px] border border-white/10 bg-[#121722] p-8 shadow-[0_0_80px_rgba(231,223,198,0.14)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e7dfc6]/30 bg-[#e7dfc6]/10">
                <Lock className="h-5 w-5 text-[#f0e8d0]" />
              </div>
            </div>
            <div className="font-display text-2xl font-black uppercase tracking-tight text-white">
              Admin Access
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/40">
              VP // Control Panel
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-[#e7dfc6]/40 focus:bg-white/[0.06]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-[#e7dfc6]/40 bg-[#e7dfc6]/10 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f0e8d0] transition-all duration-200 hover:bg-[#e7dfc6]/20 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Access Dashboard →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60">
              ← Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
