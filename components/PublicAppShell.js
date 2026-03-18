"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, isAdmin } from "@/lib/auth";

export default function PublicAppShell({ title, description, children }) {
  const router = useRouter();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-[14px] max-[900px]:fixed max-[900px]:w-full">
        <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 px-6 py-4 max-[900px]:px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[1.4rem] font-bold leading-none text-[var(--accent)]"
            >
              Luma Events
            </Link>
            <p className="hidden text-[0.85rem] text-[var(--text-muted)] max-[900px]:block">
              Discover Events
            </p>
          </div>

          <nav className="flex items-center gap-6">
            {auth?.token ? (
              <>
                <Link
                  href="/explore"
                  className="text-[var(--text-main)] transition-colors hover:text-[var(--accent)]"
                >
                  {isAdmin(auth) ? "Manage Events" : "Browse Events"}
                </Link>
                <Link
                  href="/dashboard"
                  className="text-[var(--text-main)] transition-colors hover:text-[var(--accent)]"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="text-[var(--text-main)] transition-colors hover:text-[var(--accent)]"
              >
                Home
              </Link>
            )}

            {auth?.token ? (
              <Link
                href="/account"
                className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.6rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/auth"
                className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.6rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))] pb-12 max-[900px]:mt-20">
        {title && (
          <div className="mb-8 max-[900px]:mb-6">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Event Booking Platform
            </p>
            <h1 className="mb-2 text-[2.25rem]">{title}</h1>
            {description && (
              <p className="max-w-[720px] leading-[1.7] text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
