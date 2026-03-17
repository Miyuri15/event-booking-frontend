"use client";

import { getAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    if (!auth?.token) {
      router.replace("/auth");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="mx-auto grid min-h-screen w-[min(900px,calc(100%-2rem))] place-items-center">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Preparing
          </p>
          <h2 className="mb-4 text-[1.7rem]">
            Loading your event booking experience...
          </h2>
        </section>
      </main>
    );
  }

  return children;
}
