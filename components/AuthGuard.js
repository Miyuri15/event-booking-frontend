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
  const [message, setMessage] = useState("Loading your event booking experience...");

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
      <main className="mx-auto grid min-h-screen w-[min(900px,calc(100%-2rem))] place-items-center">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Preparing
          </p>
          <h2 className="mb-4 text-[1.7rem]">{message}</h2>
        </section>
      </main>
    );
  }

  return children;
}
