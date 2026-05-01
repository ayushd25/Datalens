"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowError(false);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Login failed — is your backend running on port 5000?";
      setError(msg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex flex-col bg-surface-950">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-lg font-bold">DataLens</span>
        </Link>
        <Link href="/" className="px-4 py-2 text-sm text-surface-300 hover:text-surface-50 transition-colors">Back to Home</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p className="text-sm text-surface-400 mb-6">Sign in to your workspace</p>

            {/* Error banner — stays visible until manually dismissed */}
            {showError && error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-3">
                <svg
  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 9v3.75m0 3.75h.007M12 3a9 9 0 100 18 9 9 0 000-18z"
  />
</svg>
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                <button onClick={() => setShowError(false)} className="ml-auto text-red-300 hover:text-red-200 transition-colors text-xs font-medium px-2 py-0.5 rounded">Dismiss</button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-500 transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-sm text-surface-500 text-center mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-accent hover:text-accent-light transition-colors">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}