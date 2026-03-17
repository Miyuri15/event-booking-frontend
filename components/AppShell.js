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
  { href: "/notifications", label: "Notifications", caption: "Alerts and updates" },
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
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Event Booking</p>
          <h1 className="sidebar-title">Luma Events</h1>
          <p className="sidebar-copy">
            Discover standout experiences and manage your bookings in one place.
          </p>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={isActive ? "nav-link active-nav-link" : "nav-link"}
                href={item.href}
              >
                <span>{item.label}</span>
                <small>{item.caption}</small>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {auth?.user ? (
            <>
              <p className="footer-label">Signed in as</p>
              <p className="footer-name">{auth.user.name || auth.user.email}</p>
              <button className="secondary-button sidebar-button" onClick={handleLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="footer-label">Authentication</p>
              <Link className="primary-button sidebar-button" href="/auth">
                Login / Register
              </Link>
            </>
          )}
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Event Booking Platform</p>
            <h2 className="workspace-title">{title}</h2>
            <p className="section-copy workspace-description">{description}</p>
          </div>
          <div className="header-badge">
            <span className="badge-dot" />
            Live product interface
          </div>
        </header>

        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
