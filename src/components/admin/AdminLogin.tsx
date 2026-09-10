import React, { useState, useEffect } from "react";
import { adminSignIn, getAdminSession } from "../../lib/adminAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    getAdminSession().then((session) => {
      if (session) {
        window.location.href = "/admin/templates";
      } else {
        setIsChecking(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminSignIn(email, password);
      if (!res.success) {
        setError(res.error || "Login failed. Check your email and password.");
        setLoading(false);
        return;
      }

      window.location.href = "/admin/templates";
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#19bde7] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#202020] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#19bde7] text-black font-black text-xl">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Portal
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Sign in with your admin credentials to manage meme templates
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mememaker.com"
              className="w-full rounded-lg border border-white/15 bg-[#151515] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#19bde7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-white/15 bg-[#151515] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#19bde7] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-[#19bde7] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#15a8cf] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Sign In to Admin Panel"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <a
            href="/edit"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Public Editor
          </a>
        </div>
      </div>
    </div>
  );
}
