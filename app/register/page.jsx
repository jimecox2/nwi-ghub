"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  // Minimal data collection: username, email, password.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Set once the account is created and a confirmation email has been sent.
  const [pendingEmail, setPendingEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Server route registers against Strapi; if confirmation is OFF it returns
      // pending: false and has set the httpOnly cookie, so we sign in now.
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      if (!data.pending) {
        setUser(data.user);
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Email confirmation is ON: Strapi creates the account (confirmed=false)
      // and emails a confirmation link, but returns no JWT. The user must
      // confirm before they can log in.
      setPendingEmail(email);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  // Post-registration confirmation screen.
  if (pendingEmail) {
    return (
      <div className="mx-auto max-w-md">
        <h1>Check your email</h1>
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Your account was created. We sent a confirmation link to{" "}
          <strong>{pendingEmail}</strong>. Click the link in that email to
          activate your account, then log in.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Already confirmed?{" "}
          <Link href="/login" className="text-blue-700 underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1>Create account</h1>

      <p className="not-prose rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
        After you submit, we&apos;ll email you a confirmation link. You must
        click it to activate your account before you can log in.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="not-prose mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
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
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0b4d8e] px-4 py-2 font-medium text-white hover:bg-[#062f57] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-700 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
