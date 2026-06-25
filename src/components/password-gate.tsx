"use client";

import { useEffect, useState } from "react";

// SHA-256 of the access password. This is a soft, client-side gate only:
// a static site ships its data in JS, so this deters casual access but is not
// a real security boundary. Temporary password: "tm-preview-2026".
const PASSWORD_SHA256 =
  "e1d47bebf7a27c3ce02391a7e2f874dd07f564fd0a75eed094c1bd1e5ea243e0";

const STORAGE_KEY = "tm-dash-auth";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === PASSWORD_SHA256) {
        setAuthed(true);
      }
    } catch {
      // sessionStorage unavailable; require re-entry each load.
    }
    setReady(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    const hash = await sha256(value);
    if (hash === PASSWORD_SHA256) {
      try {
        sessionStorage.setItem(STORAGE_KEY, PASSWORD_SHA256);
      } catch {
        // ignore persistence failure
      }
      setError(false);
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
    }
    setChecking(false);
  }

  // Avoid flashing the dashboard or the form before the auth check runs.
  if (!ready) return null;
  if (authed) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold tracking-tight">
          Task Mining Adoption
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Enter the access password to view the dashboard.
        </p>

        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Password"
          aria-label="Access password"
          aria-invalid={error}
          className="mt-4 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        />

        {error ? (
          <p className="mt-2 text-xs text-[var(--danger)]">
            Incorrect password. Try again.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={checking || value.length === 0}
          className="mt-4 h-10 w-full rounded-lg bg-[var(--accent)] text-sm font-medium text-white transition-[filter] hover:brightness-95 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
