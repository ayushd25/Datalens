"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      {/* Top nav bar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-lg font-bold">DataLens</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm text-surface-300 hover:text-surface-50 transition">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1">Create account</h2>
            <p className="text-sm text-surface-400 mb-6">Start your free trial today</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition" placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition" placeholder="Min 8 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold text-sm transition disabled:opacity-50">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-surface-500 text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:text-accent-light transition">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}