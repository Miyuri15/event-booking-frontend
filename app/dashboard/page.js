"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  fetchEvents,
  updateAdminUser,
} from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

function formatPrice(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function formatEventDate(value) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function UserDashboard({ auth }) {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    availableSeats: 0,
  });

  useEffect(() => {
    const loadUserEvents = async () => {
      if (!auth?.token) return;

      try {
        // Fetch all active events
        const allEventsResponse = await fetchEvents(
          {
            status: "Active",
            limit: 100,
          },
          auth.token,
        );

        const allEvents = allEventsResponse?.data || allEventsResponse || [];

        // Get featured events (first 3)
        const featured = allEvents.slice(0, 3);

        // Get upcoming events (next 5)
        const upcoming = allEvents.slice(3, 8);

        // Calculate total available seats
        const totalSeats = allEvents.reduce(
          (sum, event) => sum + event.availableSeats,
          0,
        );

        setFeaturedEvents(featured);
        setUpcomingEvents(upcoming);

        setStats({
          totalEvents: allEvents.length,
          upcomingEvents: upcoming.length,
          availableSeats: totalSeats,
        });
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [auth]);

  if (loading) {
    return (
      <AppShell
        title="Dashboard"
        description="Loading your personalized event recommendations..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--text-muted)]">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      description="Your personalized command center for discovering events, tracking upcoming experiences, and managing your bookings."
    >
      {/* Welcome Section with Stats */}
      <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        <article className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-white p-8 shadow-lg">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            👋 Welcome Back
          </p>
          <h3 className="mb-3 text-[1.6rem] font-semibold">
            {auth?.user?.name
              ? `${auth.user.name}, ready for your next adventure?`
              : "Your next event is waiting."}
          </h3>
          <p className="leading-[1.7] text-[var(--text-muted)]">
            Browse curated experiences, revisit your ticket activity, and keep
            your account details ready for faster checkout.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-[20px] bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center transition-transform hover:scale-105">
              <strong className="mb-1 block text-3xl font-bold text-[var(--accent)]">
                {stats.totalEvents}
              </strong>
              <span className="text-sm text-[var(--text-muted)]">
                Available events
              </span>
            </div>
            <div className="rounded-[20px] bg-gradient-to-br from-blue-50 to-sky-50 p-4 text-center transition-transform hover:scale-105">
              <strong className="mb-1 block text-3xl font-bold text-blue-600">
                {stats.upcomingEvents}
              </strong>
              <span className="text-sm text-[var(--text-muted)]">
                Upcoming this week
              </span>
            </div>
          </div>
        </article>

        {/* Upcoming Events */}
        <article className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-white p-8 shadow-lg">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            📅 Coming Up
          </p>
          <h3 className="mb-4 text-[1.2rem] font-semibold">
            Your event rhythm this week
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-4 rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={event.images?.[0]?.url || "/placeholder-event.jpg"}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-event.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <strong className="block text-[1rem] group-hover:text-[var(--accent)] transition-colors">
                        {event.name}
                      </strong>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {event.venue} •{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[var(--accent)]">
                        {formatPrice(event.ticketPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-[var(--text-muted)] py-8">
                No upcoming events found
              </p>
            )}
          </div>
          <Link
            href="/explore"
            className="mt-4 inline-block text-center w-full px-4 py-2 rounded-full border border-[rgba(33,83,79,0.2)] text-[var(--secondary)] hover:bg-[rgba(33,83,79,0.05)] transition-all"
          >
            View All Events →
          </Link>
        </article>
      </section>

      {/* Featured Picks */}
      <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-white p-8 shadow-lg">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          ⭐ Featured Picks
        </p>
        <h3 className="mb-6 text-[1.2rem] font-semibold">
          Popular events worth checking today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <article
                className="group rounded-2xl border border-[rgba(54,45,32,0.08)] bg-white overflow-hidden shadow-md transition-all hover:shadow-xl hover:-translate-y-2"
                key={event._id}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.images?.[0]?.url || "/placeholder-event.jpg"}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/placeholder-event.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex rounded-full bg-[rgba(192,90,43,0.95)] px-3 py-1 text-xs font-bold text-white">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="mb-2 text-lg font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                    {event.name}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(54,45,32,0.08)]">
                    <span className="text-xl font-bold text-[var(--accent)]">
                      {formatPrice(event.ticketPrice)}
                    </span>
                    <Link
                      href={`/events/${event._id}`}
                      className="cursor-pointer rounded-full bg-gradient-to-r from-[var(--accent)] to-[#d7834d] px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="col-span-3 text-center text-[var(--text-muted)] py-8">
              No featured events available at the moment
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

// AdminDashboard with improved UI
function AdminDashboard({ auth }) {
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editAdminId, setEditAdminId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!auth?.token) return;

    const loadAdminData = async () => {
      try {
        const eventsResponse = await fetchEvents({ limit: 100 }, auth.token);
        const adminsResult = await fetchAdminUsers(auth.token);

        setAdmins(Array.isArray(adminsResult) ? adminsResult : []);
        setEvents(eventsResponse?.data || eventsResponse || []);
        setStatus({ error: "", success: "" });
      } catch (error) {
        setStatus({
          error: error.message || "Failed to load admin dashboard data.",
          success: "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [auth]);

  const eventCounts = {
    total: events.length,
    active: events.filter((event) => event.status === "Active").length,
    cancelled: events.filter((event) => event.status === "Cancelled").length,
    completed: events.filter((event) => event.status === "Completed").length,
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    try {
      const createdAdmin = await createAdminUser(createForm, auth.token);
      setAdmins((current) => [createdAdmin, ...current]);
      setCreateForm({ name: "", email: "", password: "" });
      setStatus({
        error: "",
        success: "New admin account created successfully.",
      });
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    }
  };

  const startEditingAdmin = (admin) => {
    setEditAdminId(admin._id);
    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
    });
    setStatus({ error: "", success: "" });
  };

  const handleUpdateAdmin = async (event) => {
    event.preventDefault();
    const payload = { name: editForm.name, email: editForm.email };
    if (editForm.password.trim()) payload.password = editForm.password;

    try {
      const updatedAdmin = await updateAdminUser(
        editAdminId,
        payload,
        auth.token,
      );
      setAdmins((current) =>
        current.map((admin) =>
          admin._id === updatedAdmin._id ? updatedAdmin : admin,
        ),
      );
      setEditAdminId("");
      setEditForm({ name: "", email: "", password: "" });
      setStatus({
        error: "",
        success: "Admin credentials updated successfully.",
      });
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteAdminUser(adminId, auth.token);
      setAdmins((current) => current.filter((admin) => admin._id !== adminId));
      if (editAdminId === adminId) {
        setEditAdminId("");
        setEditForm({ name: "", email: "", password: "" });
      }
      setStatus({ error: "", success: "Admin account removed successfully." });
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    }
  };

  if (loading) {
    return (
      <AppShell
        title="Admin Dashboard"
        description="Loading admin workspace..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--text-muted)]">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Admin Dashboard"
      description="Control the admin team, review event operations, and keep the platform organized from one command center."
    >
      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-md">
          <p className="text-sm uppercase tracking-wide text-[var(--accent-dark)]">
            Admins
          </p>
          <strong className="mt-2 block text-4xl font-bold text-[var(--accent)]">
            {admins.length}
          </strong>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Active admin accounts
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-6 shadow-md">
          <p className="text-sm uppercase tracking-wide text-blue-600">
            Total Events
          </p>
          <strong className="mt-2 block text-4xl font-bold text-blue-600">
            {eventCounts.total}
          </strong>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Tracked event records
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md">
          <p className="text-sm uppercase tracking-wide text-green-600">
            Active Events
          </p>
          <strong className="mt-2 block text-4xl font-bold text-green-600">
            {eventCounts.active}
          </strong>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Currently bookable
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-md">
          <p className="text-sm uppercase tracking-wide text-gray-600">
            Completed/Cancelled
          </p>
          <strong className="mt-2 block text-4xl font-bold text-gray-600">
            {eventCounts.cancelled + eventCounts.completed}
          </strong>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Past events</p>
        </div>
      </section>

      {status.error && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">⚠️ {status.error}</p>
        </div>
      )}
      {status.success && (
        <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-4">
          <p className="text-green-700">✓ {status.success}</p>
        </div>
      )}

      {/* Admin Management */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold">➕ Create New Admin</h3>
          <form className="space-y-4" onSubmit={handleCreateAdmin}>
            <input
              className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Admin name"
              required
              type="text"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
            />
            <input
              className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="admin@eventbooking.com"
              required
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
            />
            <input
              className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Temporary password"
              required
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
            />
            <button
              className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#d7834d] px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              type="submit"
            >
              Create Admin Account
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold">✏️ Update Admin</h3>
          {editAdminId ? (
            <form className="space-y-4" onSubmit={handleUpdateAdmin}>
              <input
                className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              <input
                className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
              <input
                className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Leave blank to keep current password"
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
              />
              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#d7834d] px-6 py-3 text-white font-semibold"
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="flex-1 rounded-full border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setEditAdminId("");
                    setEditForm({ name: "", email: "", password: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-center text-[var(--text-muted)] py-8">
              Select an admin from the list below to edit their credentials
            </p>
          )}
        </div>
      </section>

      {/* Admin Team List */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">👥 Admin Team</h3>
        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              className="flex flex-wrap items-center gap-4 rounded-xl border border-[rgba(54,45,32,0.08)] bg-gray-50 p-4"
              key={admin._id}
            >
              <div className="flex-1">
                <strong className="block text-lg">{admin.name}</strong>
                <span className="text-sm text-[var(--text-muted)]">
                  {admin.email}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[rgba(33,83,79,0.12)] text-sm font-semibold text-[var(--secondary)]">
                {admin.role}
              </span>
              <button
                className="px-4 py-2 rounded-full border border-[rgba(33,83,79,0.3)] text-[var(--secondary)] hover:bg-[rgba(33,83,79,0.05)] transition-all"
                onClick={() => startEditingAdmin(admin)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                onClick={() => handleDeleteAdmin(admin._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Events List */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">🎪 Event Status Overview</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-8">
              No events available
            </p>
          ) : (
            events.map((event) => (
              <div
                className="flex flex-wrap items-center gap-4 rounded-xl border border-[rgba(54,45,32,0.08)] bg-gray-50 p-4"
                key={event._id}
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={event.images?.[0]?.url || "/placeholder-event.jpg"}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-event.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <strong className="block">{event.name}</strong>
                  <p className="text-sm text-[var(--text-muted)]">
                    {event.venue}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : event.status === "Completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--text-muted)]">
                    Seats
                  </span>
                  <p className="font-semibold">
                    {event.availableSeats}/{event.totalSeats}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--text-muted)]">
                    Price
                  </span>
                  <p className="font-semibold text-[var(--accent)]">
                    {formatPrice(event.ticketPrice)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default function DashboardPage() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  return (
    <AuthGuard>
      {isAdmin(auth) ? (
        <AdminDashboard auth={auth} />
      ) : (
        <UserDashboard auth={auth} />
      )}
    </AuthGuard>
  );
}
