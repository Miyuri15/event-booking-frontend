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
      <main className="auth-guard-shell">
        <section className="panel">
          <p className="eyebrow">Preparing</p>
          <h2>Loading your event booking experience...</h2>
        </section>
      </main>
    );
  }

  return children;
}
