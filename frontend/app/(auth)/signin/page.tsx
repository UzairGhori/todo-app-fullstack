"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn({ email, password });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Dark Navy Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0E1A] p-12 lg:flex lg:w-1/2">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        {/* Gold radial glow */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F6C445] opacity-[0.04] blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6C445]">
              <svg className="h-6 w-6 text-[#0A0E1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#F1F5F9]">TaskFlow</span>
          </div>
        </div>

        <div className="relative z-10 animate-slide-up">
          <h1 className="text-4xl leading-tight font-bold text-[#F1F5F9] xl:text-5xl" style={{ letterSpacing: "-0.025em" }}>
            Organize your work,<br />
            <span className="text-[#94A3B8]">simplify your life.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-[#64748B]">
            A beautifully crafted task management experience designed for people who value clarity and productivity.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {["#F6C445", "#60a5fa", "#4ade80", "#f87171"].map((c, i) => (
              <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0E1A] text-xs font-bold text-[#0A0E1A]" style={{ background: c }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-[#64748B]">Trusted by thousands of productive people</p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full border border-white/[0.04]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full border border-white/[0.04]" />
      </div>

      {/* Right - Sign In Form */}
      <div className="flex w-full items-center justify-center bg-[#111827] px-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6C445]">
              <svg className="h-6 w-6 text-[#0A0E1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#F1F5F9]">TaskFlow</span>
          </div>

          <h2 className="text-3xl font-bold text-[#F1F5F9]" style={{ letterSpacing: "-0.025em" }}>Welcome back</h2>
          <p className="mt-2 text-[#64748B]">Sign in to continue to your dashboard</p>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-premium"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="input-premium"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A]" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#F6C445] hover:text-[#D4A832]">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
