"use client";

import { useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { changePassword } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

function ChangePasswordContent() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== passwordConfirmation) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Strapi returns a fresh JWT; keep the in-memory session current.
      const { token: newToken, user: newUser } = await changePassword({
        token,
        currentPassword,
        password,
        passwordConfirmation,
      });
      setAuth({ token: newToken, user: newUser || user });
      setSuccess("Your password has been changed.");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1>Change password</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="not-prose mt-6 space-y-4">
        <div>
          <label htmlFor="current" className="block text-sm font-medium">
            Current password
          </label>
          <input
            id="current"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="new" className="block text-sm font-medium">
            New password
          </label>
          <input
            id="new"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0b4d8e] px-4 py-2 font-medium text-white hover:bg-[#062f57] disabled:opacity-60"
        >
          {loading ? "Saving…" : "Change password"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        <Link href="/dashboard" className="text-blue-700 underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthGuard>
      <ChangePasswordContent />
    </AuthGuard>
  );
}
