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

function formatTypeLabel(type) {
  return type.replaceAll("_", " ");
}

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

  const readCount = useMemo(
    () => notifications.filter((item) => item.status === "READ").length,
    [notifications],
  );

  const inAppCount = useMemo(
    () => notifications.filter((item) => item.channel === "IN_APP").length,
    [notifications],
  );

  const latestNotification = notifications[0] || null;

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
        description="Track account activity, profile changes, and future booking updates from one place."
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
                <strong>{readCount}</strong>
                <span>Read items</span>
              </div>
            </div>
            {status.error ? <p className="status error">{status.error}</p> : null}
            <div className="summary-stack" style={{ marginTop: "1rem" }}>
              <div className="summary-card">
                <div className="notification-summary-head">Current delivery</div>
                <strong className="notification-summary-value">
                  {status.source === "service" ? "Live in-app feed" : "Preview mode"}
                </strong>
              </div>
              <div className="summary-card">
                <div className="notification-summary-head">Most recent activity</div>
                <strong className="notification-summary-value">
                  {latestNotification
                    ? formatTypeLabel(latestNotification.type)
                    : "No notifications yet"}
                </strong>
              </div>
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Current Setup</p>
            <h3>What this account supports right now</h3>
            <div className="summary-stack">
              <div className="summary-card">
                <div className="notification-summary-head">In-app delivery</div>
                <strong className="notification-summary-value">
                  {inAppCount > 0
                    ? "Active and visible inside the portal"
                    : "Enabled for account activity"}
                </strong>
              </div>
              <div className="summary-card">
                <div className="notification-summary-head">Read status sync</div>
                <strong className="notification-summary-value">
                  Unread count updates when you mark items as read
                </strong>
              </div>
              <div className="summary-card">
                <div className="notification-summary-head">Connected sources</div>
                <strong className="notification-summary-value">
                  User account events are linked. Booking and payment alerts come later.
                </strong>
              </div>
              <div className="summary-card">
                <div className="notification-summary-head">Channels not enabled</div>
                <strong className="notification-summary-value">
                  Email and SMS delivery are not configured in this build yet
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className="panel">
          <p className="eyebrow">Activity Feed</p>
          <h3>Messages for this account</h3>
          <div className="metric-row" style={{ marginBottom: "1rem" }}>
            <div className="metric-card">
              <strong>{status.source === "service" ? "Live" : "Preview"}</strong>
              <span>Service state</span>
            </div>
            <div className="metric-card">
              <strong>{inAppCount}</strong>
              <span>In-app alerts</span>
            </div>
            <div className="metric-card">
              <strong>
                {latestNotification
                  ? new Date(latestNotification.createdAt).toLocaleDateString()
                  : "-"}
              </strong>
              <span>Latest update</span>
            </div>
          </div>
          {status.loading ? (
            <p className="section-copy">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="summary-card">
              <span>Quiet for now</span>
              <strong>New account activity will appear here as notifications are created.</strong>
            </div>
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
                    <span className="event-category">{formatTypeLabel(notification.type)}</span>
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
