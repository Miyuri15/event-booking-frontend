"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuth } from "@/lib/auth";
import { fetchUserNotifications } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setAuth(getAuth());
  }, [pathname]);

  const refreshNotifications = useCallback(async () => {
    const currentAuth = getAuth();

    setAuth(currentAuth);

    if (!currentAuth?.token || !currentAuth?.user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const notifications = await fetchUserNotifications(
        currentAuth.user.id,
        currentAuth.token,
      );
      const nextUnreadCount = Array.isArray(notifications)
        ? notifications.filter((item) => item.status === "UNREAD").length
        : 0;

      setUnreadCount(nextUnreadCount);
    } catch (error) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();

    const intervalId = window.setInterval(refreshNotifications, 15000);
    const handleFocus = () => refreshNotifications();
    const handleStorage = () => refreshNotifications();
    const handleNotificationRefresh = () => refreshNotifications();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("notifications:refresh", handleNotificationRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("notifications:refresh", handleNotificationRefresh);
    };
  }, [refreshNotifications, pathname]);

  const handleLogout = () => {
    clearAuth();
    setUnreadCount(0);
    router.push("/auth");
  };

  return (
    <div className="grid h-screen grid-cols-[300px_1fr] overflow-hidden max-[900px]:h-auto max-[900px]:grid-cols-1 max-[900px]:overflow-visible">
      <aside className="grid h-screen grid-rows-[auto_1fr_auto] gap-6 overflow-y-auto bg-[rgba(29,29,27,0.92)] p-6 text-[#f6efe4] max-[900px]:h-auto max-[900px]:overflow-visible">
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

      <div className="h-screen overflow-y-auto p-6 max-[900px]:h-auto max-[900px]:overflow-visible max-[900px]:pt-0">
        <header className="mb-6 flex items-start justify-between gap-4 max-[900px]:flex-col">
          <div>
            <p className="eyebrow">Event Booking Platform</p>
            <h2 className="workspace-title">{title}</h2>
            <p className="section-copy workspace-description">{description}</p>
          </div>
          <div className="header-actions">
            <Link
              aria-label="Open notifications"
              className={
                pathname === "/notifications"
                  ? "notification-icon-button active-notification-icon-button"
                  : "notification-icon-button"
              }
              href="/notifications"
              title="Notifications"
            >
              <span className="notification-bell" aria-hidden="true" />
              {unreadCount > 0 ? (
                <span className="notification-count-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <div className="header-badge">
              <span className="badge-dot" />
              Live product interface
            </div>
          </div>
        </header>

        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
