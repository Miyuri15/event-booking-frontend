"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import {
  fetchUserNotifications,
  markNotificationAsRead,
} from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

const fallbackNotifications = [
  {
    _id: "demo-1",
    type: "BOOKING_PENDING",
    channel: "IN_APP",
    title: "Booking created",
    message: "Your booking has been created with pending status for Neon Harbor Music Night.",
    status: "UNREAD",
    createdAt: new Date().toISOString(),
    metadata: {
      source: "BOOKING_SERVICE",
      eventTitle: "Neon Harbor Music Night",
      bookingId: "BK-1001",
    },
  },
  {
    _id: "demo-2",
    type: "PAYMENT_RECEIVED",
    channel: "IN_APP",
    title: "Payment received",
    message: "Payment was received successfully for LKR 4500.",
    status: "READ",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    metadata: {
      source: "PAYMENT_SERVICE",
      paymentId: "PAY-2044",
      amount: 4500,
      currency: "LKR",
    },
  },
  {
    _id: "demo-3",
    type: "EVENT_UPDATED",
    channel: "IN_APP",
    title: "Event updated",
    message: "The event \"Moonlight Rooftop Session\" was updated successfully.",
    status: "UNREAD",
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    metadata: {
      source: "EVENT_SERVICE",
      eventTitle: "Moonlight Rooftop Session",
      entityId: "EV-311",
    },
  },
];

const PREVIEW_NOTIFICATION_COUNT = 3;

function formatTypeLabel(type) {
  return type.replaceAll("_", " ");
}

function formatSourceLabel(source) {
  if (!source) {
    return "Manual";
  }

  return source.replaceAll("_", " ");
}

function buildMetaSummary(notification) {
  const metadata = notification.metadata || {};
  const parts = [];

  if (metadata.eventTitle) {
    parts.push(metadata.eventTitle);
  }

  if (metadata.bookingId) {
    parts.push(`Booking ${metadata.bookingId}`);
  }

  if (metadata.paymentId) {
    parts.push(`Payment ${metadata.paymentId}`);
  }

  if (metadata.entityId && !metadata.bookingId && !metadata.paymentId) {
    parts.push(`Reference ${metadata.entityId}`);
  }

  return parts.join(" | ");
}

export default function NotificationsPage() {
  const [auth, setAuth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    source: "service",
  });

  const loadNotifications = useCallback(async (currentAuth) => {
    if (!currentAuth?.token || !currentAuth?.user?.id) {
      return;
    }

    try {
      const data = await fetchUserNotifications(currentAuth.user.id, currentAuth.token);
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
        error: "Live notifications are not fully connected yet. Showing contract preview data.",
        source: "fallback",
      });
    }
  }, []);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) {
      return;
    }

    loadNotifications(auth);

    const intervalId = window.setInterval(() => {
      loadNotifications(getAuth());
    }, 15000);
    const handleFocus = () => loadNotifications(getAuth());

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [auth, loadNotifications]);

  useEffect(() => {
    setShowAllNotifications(false);
  }, [notifications.length]);

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
  const displayedNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, PREVIEW_NOTIFICATION_COUNT);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("notifications:refresh", {
        detail: {
          unreadCount,
        },
      }),
    );
  }, [unreadCount]);

  const handleMarkRead = async (notificationId) => {
    const nextNotifications = notifications.map((item) =>
      item._id === notificationId ? { ...item, status: "READ" } : item,
    );

    setNotifications(nextNotifications);
    window.dispatchEvent(
      new CustomEvent("notifications:refresh", {
        detail: {
          unreadCount: nextNotifications.filter((item) => item.status === "UNREAD").length,
        },
      }),
    );

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
        description="Track booking, payment, account, and admin event updates from one place."
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
                <div className="notification-summary-head">Connected contracts</div>
                <strong className="notification-summary-value">
                  Booking, payment, user, and admin event notification types are supported
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
          <div className="flex items-start justify-between gap-4 max-[700px]:flex-col max-[700px]:items-stretch">
            <div>
              <p className="eyebrow">Activity Feed</p>
              <h3>Messages for this account</h3>
            </div>
            {notifications.length > PREVIEW_NOTIFICATION_COUNT ? (
              <button
                className="secondary-button"
                onClick={() => setShowAllNotifications((current) => !current)}
                type="button"
              >
                {showAllNotifications ? "Show latest 3" : "See all notifications"}
              </button>
            ) : null}
          </div>
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
          {!status.loading && notifications.length > PREVIEW_NOTIFICATION_COUNT ? (
            <p className="section-copy" style={{ marginBottom: "1rem" }}>
              {showAllNotifications
                ? `Showing all ${notifications.length} notifications.`
                : `Showing the latest ${PREVIEW_NOTIFICATION_COUNT} notifications.`}
            </p>
          ) : null}
          {status.loading ? (
            <p className="section-copy">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="summary-card">
              <span>Quiet for now</span>
              <strong>New account activity will appear here as notifications are created.</strong>
            </div>
          ) : (
            <div className="notification-list">
              {displayedNotifications.map((notification) => {
                const metaSummary = buildMetaSummary(notification);

                return (
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
                      {metaSummary ? <small>{metaSummary}</small> : null}
                      <small>
                        {formatSourceLabel(notification.metadata?.source)} | {notification.channel} | {new Date(notification.createdAt).toLocaleString()}
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
                );
              })}
            </div>
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
