"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import {
  fetchUserNotifications,
  markNotificationAsRead,
} from "@/lib/api";
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
    message: "Your payment was processed successfully and your ticket is ready.",
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
        window.dispatchEvent(new Event("notifications:refresh"));
      } catch (error) {
        setNotifications(fallbackNotifications);
        setStatus({
          loading: false,
          error: "Notification service is not connected yet. Showing preview data.",
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
    window.dispatchEvent(new Event("notifications:refresh"));

    if (status.source !== "service" || !auth?.token) {
      return;
    }

    try {
      await markNotificationAsRead(notificationId, auth.token);
      window.dispatchEvent(new Event("notifications:refresh"));
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
        <section className="workspace-grid">
          <article className="panel">
            <p className="eyebrow">Notification Center</p>
            <h3>Your latest activity updates</h3>
            <div className="metric-row">
              <div className="metric-card">
                <strong>{notifications.length}</strong>
                <span>Total notifications</span>
              </div>
              <div className="metric-card">
                <strong>{unreadCount}</strong>
                <span>Unread items</span>
              </div>
              <div className="metric-card">
                <strong>{status.source === "service" ? "Live" : "Preview"}</strong>
                <span>Data source</span>
              </div>
            </div>
            {status.error ? <p className="status error">{status.error}</p> : null}
          </article>

          <article className="panel">
            <p className="eyebrow">Preferences</p>
            <h3>Delivery channels</h3>
            <div className="summary-stack">
              <div className="summary-card">
                <span>Email</span>
                <strong>Booking confirmations enabled</strong>
              </div>
              <div className="summary-card">
                <span>In-app</span>
                <strong>Payment and reminder alerts enabled</strong>
              </div>
              <div className="summary-card">
                <span>SMS</span>
                <strong>Optional for urgent event changes</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="panel">
          <p className="eyebrow">Activity Feed</p>
          <h3>Messages for this account</h3>
          {status.loading ? (
            <p className="section-copy">Loading notifications...</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <article
                  className={
                    notification.status === "UNREAD"
                      ? "notification-card unread-notification-card"
                      : "notification-card"
                  }
                  key={notification._id}
                >
                  <div className="notification-copy">
                    <span className="event-category">{notification.type.replaceAll("_", " ")}</span>
                    <h4>{notification.title || notification.type}</h4>
                    <p>{notification.message}</p>
                    <small>
                      {notification.channel} | {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="notification-actions">
                    <span className="status-pill">{notification.status}</span>
                    {notification.status === "UNREAD" ? (
                      <button
                        className="secondary-button"
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
