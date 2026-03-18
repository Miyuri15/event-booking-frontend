"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  fetchEvents, // Changed from fetchUserEvents
  updateAdminUser,
} from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

function UserDashboard({ auth }) {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recommended: 0,
    upcoming: 0,
    savedVenues: 0
  });

  useEffect(() => {
    const loadUserEvents = async () => {
      if (!auth?.token) return;

      try {
        // Fetch featured events (maybe upcoming or popular ones)
        const featuredResponse = await fetchEvents({
          limit: 3,
          status: 'Active',
          sort: 'date'
        }, auth.token);

        // Fetch user's upcoming bookings/events
        const upcomingResponse = await fetchEvents({
          status: 'Active',
          startDate: new Date().toISOString(),
          limit: 3
        }, auth.token);

        // Handle the response structure (with pagination)
        const featuredEventsData = featuredResponse.data || [];
        const upcomingEventsData = upcomingResponse.data || [];

        setFeaturedEvents(featuredEventsData);
        setUpcomingEvents(upcomingEventsData);
        
        // Update stats
        setStats({
          recommended: featuredResponse.pagination?.total || featuredEventsData.length,
          upcoming: upcomingResponse.pagination?.total || upcomingEventsData.length,
          savedVenues: 12 // This might come from user preferences later
        });
      } catch (error) {
        console.error('Failed to load events:', error);
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
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Loading
          </p>
          <h3 className="mb-3 text-[1.05rem]">Preparing your dashboard...</h3>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      description="A personalized starting point for discovering standout events, checking upcoming plans, and getting back into your booking activity quickly."
    >
      <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        <article className="min-h-[320px] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Welcome Back
          </p>
          <h3 className="mb-3 text-[1.05rem]">
            {auth?.user?.name
              ? `${auth.user.name}, your weekend looks open.`
              : "Your next event is waiting."}
          </h3>
          <p className="leading-[1.7] text-[var(--text-muted)]">
            Browse curated experiences, revisit your ticket activity, and keep
            your account details ready for faster checkout.
          </p>

          <div className="mt-[1.2rem] grid grid-cols-3 gap-[0.85rem] max-[900px]:grid-cols-1">
            <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
              <strong className="mb-1 block text-2xl">{stats.recommended}</strong>
              <span className="text-[var(--text-muted)]">
                Recommended events
              </span>
            </div>
            <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
              <strong className="mb-1 block text-2xl">{stats.upcoming}</strong>
              <span className="text-[var(--text-muted)]">
                Upcoming experiences
              </span>
            </div>
            <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
              <strong className="mb-1 block text-2xl">{stats.savedVenues}</strong>
              <span className="text-[var(--text-muted)]">Saved venues</span>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Coming Up
          </p>
          <h3 className="mb-3 text-[1.05rem]">Your event rhythm this month</h3>
          <div className="grid gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                >
                  <span className="mt-[0.45rem] h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
                  <div>
                    <strong>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}</strong>
                    <p className="mb-0 text-[var(--text-muted)]">
                      {event.name} at {new Date(event.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)]">No upcoming events found</p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          Featured Picks
        </p>
        <h3 className="mb-3 text-[1.05rem]">
          Popular events worth checking today
        </h3>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <article
                className="rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.78)] p-[1.2rem] shadow-[0_16px_35px_rgba(50,38,22,0.06)]"
                key={event._id}
              >
                <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
                  {event.category}
                </span>
                <h4 className="mb-2 text-[1.15rem]">{event.name}</h4>
                <p className="mb-0 text-[var(--text-muted)]">{event.venue}</p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <Link
                    href={`/events/${event._id}`}
                    className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px no-underline inline-block"
                  >
                    View Details
                  </Link>
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

// AdminDashboard component remains mostly the same but with updated event fetching
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
    if (!auth?.token) {
      return;
    }

    const loadAdminData = async () => {
      try {
        // Fetch all events (including all statuses) for admin view
        const eventsResponse = await fetchEvents({ limit: 100 }, auth.token);
        
        // Fetch admin users
        const adminsResult = await fetchAdminUsers(auth.token);

        setAdmins(Array.isArray(adminsResult) ? adminsResult : []);
        setEvents(eventsResponse.data || []);
        setStatus({ error: "", success: "" });
      } catch (error) {
        setStatus({
          error: error.message || "Failed to load admin dashboard data.",
          success: "",
        });
        setAdmins([]);
        setEvents([]);
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

  // Rest of your AdminDashboard component remains the same...
  // (keep all the existing admin functions and JSX)
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

    const payload = {
      name: editForm.name,
      email: editForm.email,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    try {
      const updatedAdmin = await updateAdminUser(editAdminId, payload, auth.token);
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
      setStatus({
        error: "",
        success: "Admin account removed successfully.",
      });
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    }
  };

  return (
    <AppShell
      title="Admin Dashboard"
      description="Control the admin team, review event operations, and keep the platform organized from one command center."
    >
      {loading ? (
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Loading
          </p>
          <h3 className="mb-3 text-[1.05rem]">Preparing the admin workspace...</h3>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
            <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
              <span className="text-[0.8rem] uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Admins
              </span>
              <strong className="mt-2 block text-3xl">{admins.length}</strong>
              <p className="mt-2 text-[var(--text-muted)]">Active admin accounts</p>
            </article>
            <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
              <span className="text-[0.8rem] uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Events
              </span>
              <strong className="mt-2 block text-3xl">{eventCounts.total}</strong>
              <p className="mt-2 text-[var(--text-muted)]">Tracked event records</p>
            </article>
            <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
              <span className="text-[0.8rem] uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Active
              </span>
              <strong className="mt-2 block text-3xl">{eventCounts.active}</strong>
              <p className="mt-2 text-[var(--text-muted)]">Currently bookable events</p>
            </article>
            <article className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
              <span className="text-[0.8rem] uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Interrupted
              </span>
              <strong className="mt-2 block text-3xl">
                {eventCounts.cancelled + eventCounts.completed}
              </strong>
              <p className="mt-2 text-[var(--text-muted)]">
                Cancelled or completed events
              </p>
            </article>
          </section>

          {status.error ? (
            <p className="mt-6 rounded-2xl border border-[rgba(182,61,61,0.18)] bg-[rgba(182,61,61,0.08)] px-4 py-[0.9rem] text-[var(--danger)]">
              {status.error}
            </p>
          ) : null}
          {status.success ? (
            <p className="mt-6 rounded-2xl border border-[rgba(47,125,83,0.18)] bg-[rgba(47,125,83,0.08)] px-4 py-[0.9rem] text-[var(--success)]">
              {status.success}
            </p>
          ) : null}

          <section className="mt-6 grid grid-cols-2 gap-6 max-[1100px]:grid-cols-1">
            <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Create Admin
              </p>
              <h3 className="mb-4 text-[1.05rem]">Add a new administrator</h3>
              <form className="grid gap-4" onSubmit={handleCreateAdmin}>
                <input
                  className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                  placeholder="Admin name"
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                  placeholder="admin@eventbooking.com"
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
                <input
                  className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                  placeholder="Temporary password"
                  required
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
                <button
                  className="w-full cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)]"
                  type="submit"
                >
                  Create Admin
                </button>
              </form>
            </article>

            <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Update Admin
              </p>
              <h3 className="mb-4 text-[1.05rem]">Edit selected admin credentials</h3>
              {editAdminId ? (
                <form className="grid gap-4" onSubmit={handleUpdateAdmin}>
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    required
                    type="text"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    placeholder="Leave blank to keep current password"
                    type="password"
                    value={editForm.password}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white"
                      type="submit"
                    >
                      Save Admin
                    </button>
                    <button
                      className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)]"
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
                <p className="leading-[1.7] text-[var(--text-muted)]">
                  Select an admin from the team list below to update their name,
                  email, or password.
                </p>
              )}
            </article>
          </section>

          <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Admin Team
            </p>
            <h3 className="mb-4 text-[1.05rem]">Manage administrator access</h3>
            <div className="grid gap-4">
              {admins.map((admin) => (
                <article
                  className="flex flex-wrap items-center gap-4 rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4"
                  key={admin._id}
                >
                  <div>
                    <strong className="block text-[1rem]">{admin.name}</strong>
                    <span className="text-[var(--text-muted)]">{admin.email}</span>
                  </div>
                  <span className="ml-auto inline-flex rounded-full bg-[rgba(33,83,79,0.12)] px-3 py-2 text-[0.82rem] font-bold text-[var(--secondary)]">
                    {admin.role}
                  </span>
                  <button
                    className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-4 py-2 text-[var(--secondary)]"
                    type="button"
                    onClick={() => startEditingAdmin(admin)}
                  >
                    Edit
                  </button>
                  <button
                    className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,#b63d3d_0%,#d45a5a_100%)] px-4 py-2 text-white"
                    type="button"
                    onClick={() => handleDeleteAdmin(admin._id)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Event Status
            </p>
            <h3 className="mb-4 text-[1.05rem]">Live event details and health</h3>
            <div className="grid gap-4">
              {events.length === 0 ? (
                <p className="text-[var(--text-muted)]">
                  No events are available from the event service yet.
                </p>
              ) : (
                events.map((event) => (
                  <article
                    className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr] gap-4 rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4 max-[900px]:grid-cols-1"
                    key={event._id}
                  >
                    <div>
                      <strong className="block text-[1rem]">{event.name}</strong>
                      <p className="mt-1 text-[var(--text-muted)]">
                        {event.venue} | {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="block text-[0.82rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Status
                      </span>
                      <strong>{event.status}</strong>
                    </div>
                    <div>
                      <span className="block text-[0.82rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Seats
                      </span>
                      <strong>
                        {event.availableSeats}/{event.totalSeats}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[0.82rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Price
                      </span>
                      <strong>LKR {Number(event.ticketPrice || 0).toLocaleString()}</strong>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
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
      {isAdmin(auth) ? <AdminDashboard auth={auth} /> : <UserDashboard auth={auth} />}
    </AuthGuard>
  );
}