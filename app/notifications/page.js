"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { fetchUserNotifications, markNotificationAsRead } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";

const fallbackNotifications = [
  {
    _id: "demo-1",
    type: "BOOKING_CONFIRMATION",
    channel: "EMAIL",
    title: "Booking confirmed",
    message: "Your reservation for Neon Harbor Music Night has been confirmed.",
    status: "UNREAD",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    type: "PAYMENT_SUCCESS",
    channel: "IN_APP",
    title: "Payment received",
    message:
      "Your payment was processed successfully and your ticket is ready.",
    status: "READ",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export default function NotificationsPage() {
  const [auth, setAuth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    source: "service",
  });

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) {
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await fetchUserNotifications(auth.user.id, auth.token);
        setNotifications(Array.isArray(data) ? data : []);
        setStatus({
          loading: false,
          error: "",
          source: "service",
        });
      } catch (error) {
        setNotifications(fallbackNotifications);
        setStatus({
          loading: false,
          error:
            "Notification service is not connected yet. Showing preview data.",
          source: "fallback",
        });
      }
    };

    loadNotifications();
  }, [auth]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === "UNREAD").length,
    [notifications],
  );

  const handleMarkRead = async (notificationId) => {
    setNotifications((current) =>
      current.map((item) =>
        item._id === notificationId ? { ...item, status: "READ" } : item,
      ),
    );

    if (status.source !== "service" || !auth?.token) {
      return;
    }

    try {
      await markNotificationAsRead(notificationId, auth.token);
    } catch (error) {
      // Keep optimistic UI.
    }
  };

  return (
    <AuthGuard>
      <AppShell
        title="Notifications"
        description="Stay on top of booking confirmations, payment updates, reminders, and service alerts in one notification center."
      >
        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Notification Center
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Your latest activity updates
            </h3>
            <div className="mt-[1.2rem] grid grid-cols-3 gap-[0.85rem] max-[900px]:grid-cols-1">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">
                  {notifications.length}
                </strong>
                <span className="text-[var(--text-muted)]">
                  Total notifications
                </span>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">{unreadCount}</strong>
                <span className="text-[var(--text-muted)]">Unread items</span>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">
                  {status.source === "service" ? "Live" : "Preview"}
                </strong>
                <span className="text-[var(--text-muted)]">Data source</span>
              </div>
            </div>
            {status.error ? (
              <p className="mt-4 rounded-2xl border border-[rgba(182,61,61,0.18)] bg-[rgba(182,61,61,0.08)] px-4 py-[0.9rem] text-[var(--danger)]">
                {status.error}
              </p>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Preferences
            </p>
            <h3 className="mb-3 text-[1.05rem]">Delivery channels</h3>
            <div className="grid gap-4">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Email</span>
                <strong>Booking confirmations enabled</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>In-app</span>
                <strong>Payment and reminder alerts enabled</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>SMS</span>
                <strong>Optional for urgent event changes</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Activity Feed
          </p>
          <h3 className="mb-3 text-[1.05rem]">Messages for this account</h3>
          {status.loading ? (
            <p className="leading-[1.7] text-[var(--text-muted)]">
              Loading notifications...
            </p>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notification) => (
                <article
                  className={
                    notification.status === "UNREAD"
                      ? "grid grid-cols-[1fr_auto] items-start justify-between gap-4 rounded-[22px] border border-[rgba(192,90,43,0.24)] bg-[rgba(255,255,255,0.72)] px-[1.1rem] py-4 shadow-[0_0_0_4px_rgba(192,90,43,0.06)] max-[900px]:grid-cols-1"
                      : "grid grid-cols-[1fr_auto] items-start justify-between gap-4 rounded-[22px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.72)] px-[1.1rem] py-4 max-[900px]:grid-cols-1"
                  }
                  key={notification._id}
                >
                  <div className="grid gap-2">
                    <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
                      {notification.type.replaceAll("_", " ")}
                    </span>
                    <h4 className="mb-2 text-[1.15rem]">
                      {notification.title || notification.type}
                    </h4>
                    <p className="mb-0 text-[var(--text-muted)]">
                      {notification.message}
                    </p>
                    <small className="text-[var(--text-muted)]">
                      {notification.channel} |{" "}
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="grid content-start justify-items-end gap-3 max-[900px]:justify-items-start">
                    <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                      {notification.status}
                    </span>
                    {notification.status === "UNREAD" ? (
                      <button
                        className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                        onClick={() => handleMarkRead(notification._id)}
                        type="button"
                      >
                        Mark as Read
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
