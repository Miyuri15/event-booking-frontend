"use client";

import { getAuth, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
  allowedRoles = null,
  redirectTo = "/auth",
  unauthorizedRedirectTo = "/dashboard",
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState(
    "Loading your event booking experience...",
  );

  useEffect(() => {
    const auth = getAuth();

    if (!auth?.token) {
      setMessage("Redirecting you to sign in...");
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(getUserRole(auth))) {
      setMessage("This area is only available for administrators.");
      router.replace(unauthorizedRedirectTo);
      return;
    }

    setReady(true);
  }, [allowedRoles, redirectTo, router, unauthorizedRedirectTo]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <section className="flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-8 py-12 text-center shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-[var(--accent-soft)] opacity-25"></span>
            <svg
              className="h-8 w-8 animate-spin text-[var(--accent)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.25em] text-[var(--accent-dark)] uppercase">
              Preparing
            </p>
            <h2 className="text-xl font-serif text-[var(--text-main)] md:text-2xl">
              {message}
            </h2>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
