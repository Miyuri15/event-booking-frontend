"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", caption: "Your overview" },
  { href: "/explore", label: "Explore", caption: "Find events" },
  { href: "/bookings", label: "Bookings", caption: "Reservations" },
  { href: "/payments", label: "Payments", caption: "Wallet and checkout" },
  {
    href: "/notifications",
    label: "Notifications",
    caption: "Alerts and updates",
  },
  { href: "/account", label: "Account", caption: "Profile settings" },
];

export default function AppShell({ title, description, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth");
  };

  return (
    <div className="grid min-h-screen grid-cols-[300px_1fr] max-[900px]:grid-cols-1">
      <aside className="sticky top-0 grid min-h-screen grid-rows-[auto_1fr_auto] gap-6 bg-[rgba(29,29,27,0.92)] p-6 text-[#f6efe4] max-[900px]:static max-[900px]:min-h-auto">
        <div className="brand-block">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[rgba(246,239,228,0.72)]">
            Event Booking
          </p>
          <h1 className="mb-[0.8rem] text-[2.2rem] leading-[0.96]">
            Luma Events
          </h1>
          <p className="text-[rgba(246,239,228,0.72)]">
            Discover standout experiences and manage your bookings in one place.
          </p>
        </div>

        <nav className="grid gap-[0.7rem]">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={
                  isActive
                    ? "grid gap-[0.2rem] rounded-[18px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,rgba(192,90,43,0.9),rgba(138,53,21,0.95))] px-[1.05rem] py-4 transition-[transform,background,border-color] duration-200 hover:translate-x-[2px]"
                    : "grid gap-[0.2rem] rounded-[18px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.04)] px-[1.05rem] py-4 transition-[transform,background,border-color] duration-200 hover:translate-x-[2px] hover:bg-[rgba(255,255,255,0.08)]"
                }
                href={item.href}
              >
                <span className="text-base text-[#fff8ef]">{item.label}</span>
                <small
                  className={
                    isActive
                      ? "text-[rgba(255,244,232,0.86)]"
                      : "text-[rgba(246,239,228,0.72)]"
                  }
                >
                  {item.caption}
                </small>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] p-4">
          {auth?.user ? (
            <>
              <p className="text-[rgba(246,239,228,0.72)]">Signed in as</p>
              <p className="mb-4 font-bold">
                {auth.user.name || auth.user.email}
              </p>
              <button
                className="w-full cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-center text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="text-[rgba(246,239,228,0.72)]">Authentication</p>
              <Link
                className="block w-full cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-center text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                href="/auth"
              >
                Login / Register
              </Link>
            </>
          )}
        </div>
      </aside>

      <div className="p-6 max-[900px]:pt-0">
        <header className="mb-6 flex items-start justify-between gap-4 max-[900px]:flex-col">
          <div>
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Event Booking Platform
            </p>
            <h2 className="mb-2 text-[2.25rem]">{title}</h2>
            <p className="max-w-[720px] leading-[1.7] text-[var(--text-muted)]">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              aria-label="Open notifications"
              className={
                pathname === "/notifications"
                  ? "inline-flex items-center rounded-full border border-[rgba(192,90,43,0.28)] bg-[rgba(255,255,255,0.8)] px-4 py-[0.8rem] text-[var(--accent-dark)] shadow-[0_0_0_4px_rgba(192,90,43,0.08)]"
                  : "inline-flex items-center rounded-full border border-[rgba(54,45,32,0.1)] bg-[rgba(255,255,255,0.72)] px-4 py-[0.8rem] text-[var(--accent-dark)]"
              }
              href="/notifications"
              title="Notifications"
            >
              Notifications
            </Link>
            <div className="inline-flex whitespace-nowrap rounded-full border border-[rgba(54,45,32,0.1)] bg-[rgba(255,255,255,0.62)] px-4 py-[0.8rem] text-[var(--secondary)]">
              <span className="mr-[0.55rem] inline-block h-[10px] w-[10px] rounded-full bg-[var(--secondary)]" />
              <span>Live product interface</span>
            </div>
          </div>
        </header>

        <main className="grid gap-6">{children}</main>
      </div>
    </div>
  );
}
