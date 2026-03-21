"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuth, isAdmin } from "@/lib/auth";
import { fetchUserNotifications } from "@/lib/api";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCallback, useEffect, useState } from "react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", caption: "Your overview" },
  { href: "/explore", label: "Events", caption: "Browse and manage events" },
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    const handleNotificationRefresh = (event) => {
      const nextUnreadCount = event?.detail?.unreadCount;

      if (typeof nextUnreadCount === "number") {
        setUnreadCount(nextUnreadCount);
        return;
      }

      refreshNotifications();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("notifications:refresh", handleNotificationRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "notifications:refresh",
        handleNotificationRefresh,
      );
    };
  }, [refreshNotifications, pathname]);

  const handleLogout = () => {
    clearAuth();
    setUnreadCount(0);
    setShowLogoutModal(false);
    router.push("/auth");
  };

  const isUserAdmin = auth ? isAdmin(auth) : false;

  // Create navigation items based on user role
  const getNavigationItems = () => {
    if (isUserAdmin) {
      // For admin, replace the Events link to point to admin page
      return navigationItems.map((item) => {
        if (item.href === "/explore") {
          return {
            ...item,
            href: "/admin/events",
            label: "Events",
            caption: "Create, edit, and manage events",
          };
        }
        return item;
      });
    }
    return navigationItems;
  };

  const currentNavigationItems = getNavigationItems();

  return (
    <>
      <div className="grid h-screen grid-cols-[300px_1fr] overflow-hidden max-[900px]:h-auto max-[900px]:grid-cols-1 max-[900px]:overflow-visible">
        <aside className="grid h-screen grid-rows-[auto_1fr_auto] gap-6 overflow-y-auto bg-[rgba(29,29,27,0.92)] p-6 text-[#f6efe4] max-[900px]:h-auto max-[900px]:overflow-visible">
          <div className="brand-block">
            <p className="eyebrow">Event Booking</p>
            <h1 className="sidebar-title">Luma Events</h1>
            <p className="sidebar-copy">
              Discover standout experiences and manage your bookings in one
              place.
            </p>
          </div>

          <nav className="nav-list">
            {currentNavigationItems.map((item) => {
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
                <p className="footer-name">
                  {auth.user.name || auth.user.email}
                </p>
                <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[rgba(246,239,228,0.72)]">
                  {isUserAdmin ? "Admin" : "User"}
                </p>
                <button
                  className="secondary-button sidebar-button"
                  onClick={() => setShowLogoutModal(true)}
                  type="button"
                >
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
              <p className="section-copy workspace-description">
                {description}
              </p>
            </div>
            <div className="header-actions">
              <Link
                aria-label={`Open notifications (${unreadCount} unread)`}
                className={
                  pathname === "/notifications"
                    ? "notification-icon-button active-notification-icon-button"
                    : "notification-icon-button"
                }
                href="/notifications"
                title="Notifications"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 17h5l-1.405-1.405A2.03 2.03 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </header>

          <main className="workspace-content">{children}</main>
        </div>
      </div>

      <ConfirmationModal
        cancelLabel="Stay signed in"
        confirmLabel="Logout"
        description="You will be signed out of your account and returned to the login page."
        isDanger
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Are you sure you want to logout?"
      />
    </>
  );
}
