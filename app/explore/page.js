"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { createEvent, fetchEvents } from "@/lib/api"; // Changed from fetchUserEvents
import { getAuth, isAdmin } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";

const fallbackEvents = [
  {
    _id: "demo-1",
    name: "Pulse Arena Live",
    description:
      "A stadium-scale electronic show with immersive visuals and premium floor access.",
    category: "Concert",
    venue: "Colombo Arena",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    ticketPrice: 7500,
    availableSeats: 320,
    totalSeats: 500,
    status: "Active",
    createdBy: "demo-user",
    images: [],
  },
  {
    _id: "demo-2",
    name: "Future of Product Asia",
    description:
      "A one-day summit for founders, designers, and builders shaping digital products.",
    category: "Conference",
    venue: "Hilton Colombo",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    ticketPrice: 12000,
    availableSeats: 140,
    totalSeats: 240,
    status: "Active",
    createdBy: "demo-user",
    images: [],
  },
  {
    _id: "demo-3",
    name: "Lanterns and Jazz Evening",
    description:
      "A premium city-night gathering with live jazz, warm dining, and garden seating.",
    category: "Other",
    venue: "Independence Arcade",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
    ticketPrice: 5400,
    availableSeats: 0,
    totalSeats: 180,
    status: "Completed",
    createdBy: "demo-user",
    images: [],
  },
];

function formatPrice(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function formatEventDate(value) {
  return new Date(value).toLocaleString();
}

function EventsHero({ adminMode, eventCount, activeCount }) {
  return (
    <section className="grid grid-cols-[1.15fr_0.85fr] gap-6 max-[1000px]:grid-cols-1">
      <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          {adminMode ? "Event Control" : "Explore Events"}
        </p>
        <h3 className="mb-3 text-[1.6rem]">
          {adminMode
            ? "Monitor listings and keep the event catalog healthy."
            : "Browse the latest experiences and choose what you want to attend."}
        </h3>
        <p className="leading-[1.7] text-[var(--text-muted)]">
          {adminMode
            ? "This workspace keeps admin actions visible while still showing the same live event overview your users see."
            : "This page shows live event details from the event service, including venue, timing, seat availability, and current status."}
        </p>
      </article>

      <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          Snapshot
        </p>
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
            <strong className="mb-1 block text-3xl">{eventCount}</strong>
            <span className="text-[var(--text-muted)]">Events available</span>
          </div>
          <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
            <strong className="mb-1 block text-3xl">{activeCount}</strong>
            <span className="text-[var(--text-muted)]">Active listings</span>
          </div>
        </div>
      </article>
    </section>
  );
}

function EventCard({ event, adminMode, onSelect }) {
  const isReserveDisabled =
    event.status !== "Active" || Number(event.availableSeats) <= 0;

  return (
    <article className="flex min-h-[300px] flex-col rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.78)] p-[1.2rem] shadow-[0_16px_35px_rgba(50,38,22,0.06)]">
      <div className="mb-[0.9rem] flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
          {event.category || "Event"}
        </span>
        <span className="inline-flex rounded-full bg-[rgba(33,83,79,0.12)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--secondary)]">
          {event.status}
        </span>
      </div>

      <h4 className="mb-2 text-[1.15rem]">{event.name}</h4>
      <p className="leading-[1.7] text-[var(--text-muted)] line-clamp-3">
        {event.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-[var(--text-muted)] max-[560px]:grid-cols-1">
        <div>
          <span className="block text-[0.8rem] uppercase tracking-[0.16em]">
            Venue
          </span>
          <strong className="text-[var(--text-main)]">{event.venue}</strong>
        </div>
        <div>
          <span className="block text-[0.8rem] uppercase tracking-[0.16em]">
            Date
          </span>
          <strong className="text-[var(--text-main)]">
            {formatEventDate(event.date)}
          </strong>
        </div>
        <div>
          <span className="block text-[0.8rem] uppercase tracking-[0.16em]">
            Price
          </span>
          <strong className="text-[var(--text-main)]">
            {formatPrice(event.ticketPrice)}
          </strong>
        </div>
        <div>
          <span className="block text-[0.8rem] uppercase tracking-[0.16em]">
            Seats
          </span>
          <strong className="text-[var(--text-main)]">
            {event.availableSeats}/{event.totalSeats}
          </strong>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        {adminMode ? (
          <>
            <button
              className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              type="button"
              onClick={() => onSelect(event)}
            >
              Edit Event
            </button>
            <button
              className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              type="button"
            >
              Review Status
            </button>
          </>
        ) : (
          <>
            <button
              className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isReserveDisabled}
              type="button"
            >
              {isReserveDisabled ? "Unavailable" : "Reserve Seat"}
            </button>
            <button
              className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              type="button"
              onClick={() => onSelect(event)}
            >
              See Details
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function EventDetailPanel({ event, adminMode }) {
  if (!event) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
      <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
        {adminMode ? "Admin Preview" : "Event Details"}
      </p>
      <h3 className="mb-3 text-[1.2rem]">{event.name}</h3>
      <p className="leading-[1.7] text-[var(--text-muted)]">
        {event.description}
      </p>

      <div className="mt-5 grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
          <span className="block text-[0.8rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Venue
          </span>
          <strong>{event.venue}</strong>
        </div>
        <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
          <span className="block text-[0.8rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Status
          </span>
          <strong>{event.status}</strong>
        </div>
        <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
          <span className="block text-[0.8rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Date
          </span>
          <strong>{formatEventDate(event.date)}</strong>
        </div>
        <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.68)] p-4">
          <span className="block text-[0.8rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Ticket Price
          </span>
          <strong>{formatPrice(event.ticketPrice)}</strong>
        </div>
      </div>

      {event.images && event.images.length > 0 && (
        <div className="mt-5">
          <span className="block text-[0.8rem] uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2">
            Event Images
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {event.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.caption || event.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {adminMode ? (
        <div className="mt-5 rounded-[20px] border border-[rgba(192,90,43,0.15)] bg-[rgba(192,90,43,0.08)] p-4 text-[var(--text-muted)]">
          <strong>Created By:</strong> {event.createdBy}
          <br />
          <strong>Event ID:</strong> {event._id}
          <br />
          <strong>Available Seats:</strong> {event.availableSeats}/
          {event.totalSeats} (
          {((event.availableSeats / event.totalSeats) * 100).toFixed(1)}%
          available)
        </div>
      ) : null}
    </section>
  );
}

export default function ExplorePage() {
  const [auth, setAuth] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    source: "service",
  });

  // Updated to match backend event model
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    venue: "",
    date: "",
    totalSeats: "",
    ticketPrice: "",
    category: "Other",
    // Note: availableSeats is automatically set by backend, status defaults to "Active"
  });

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const loadEvents = async (token) => {
    try {
      const data = await fetchUserEvents(token);
      const nextEvents =
        Array.isArray(data) && data.length ? data : fallbackEvents;
      setEvents(nextEvents);
      setSelectedEvent(nextEvents[0] || null);
      setStatus({
        loading: false,
        error:
          Array.isArray(data) && data.length
            ? ""
            : "Event service returned no records yet. Showing preview events.",
        source: Array.isArray(data) && data.length ? "service" : "fallback",
      });
    } catch (error) {
      setEvents(fallbackEvents);
      setSelectedEvent(fallbackEvents[0]);
      setStatus({
        loading: false,
        error:
          "Live event data is unavailable right now. Showing preview events.",
        source: "fallback",
      });
    }
  };

  useEffect(() => {
    if (!auth?.token) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    const loadEvents = async () => {
      try {
        // Fetch active events by default
        const response = await fetchEvents({ status: "Active" }, auth.token);
        // The API returns { data: [...], pagination: {...} }
        const eventsData = response?.data || [];

        if (eventsData.length > 0) {
          setEvents(eventsData);
          setSelectedEvent(eventsData[0]);
          setStatus({
            loading: false,
            error: "",
            source: "service",
          });
        } else {
          setEvents(fallbackEvents);
          setSelectedEvent(fallbackEvents[0]);
          setStatus({
            loading: false,
            error: "No events found. Showing preview events.",
            source: "fallback",
          });
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents(fallbackEvents);
        setSelectedEvent(fallbackEvents[0]);
        setStatus({
          loading: false,
          error:
            "Live event data is unavailable right now. Showing preview events.",
          source: "fallback",
        });
      }
    };

    loadEvents();
  }, [auth]);

  const adminMode = useMemo(() => isAdmin(auth), [auth]);
  const activeCount = useMemo(
    () => events.filter((event) => event.status === "Active").length,
    [events],
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEventDate = (dateString) => {
    const selectedDate = new Date(dateString);
    const now = new Date();
    return selectedDate > now;
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    // Get token from auth - no need to clean here as we'll clean in api.js
    const token = auth?.token;

    if (!token) {
      setStatus((prev) => ({
        ...prev,
        error: "You must be logged in to create an event",
      }));
      return;
    }

    // Validate date is in future
    if (!validateEventDate(createForm.date)) {
      setStatus((prev) => ({
        ...prev,
        error: "Event date must be in the future",
      }));
      return;
    }

    // Prepare payload matching backend model
    const payload = {
      name: createForm.name,
      description: createForm.description,
      venue: createForm.venue,
      date: new Date(createForm.date).toISOString(),
      totalSeats: Number(createForm.totalSeats),
      ticketPrice: Number(createForm.ticketPrice),
      category: createForm.category,
      createdBy: auth?.user?.id || auth?.user?._id,
    };

    // Add image if selected
    if (imageFile) {
      payload.images = imageFile;
    }

    try {
      setStatus((prev) => ({ ...prev, loading: true, error: "" }));

      const createdEvent = await createEvent(payload, token);

      // Add created event to list
      setEvents((current) => [createdEvent, ...current]);
      setSelectedEvent(createdEvent);

      // Reset form
      setCreateForm({
        name: "",
        description: "",
        venue: "",
        date: "",
        totalSeats: "",
        ticketPrice: "",
        category: "Other",
      });
      setImageFile(null);
      setImagePreview(null);

      setStatus({
        loading: false,
        error: "",
        source: "service",
      });
      await loadEvents(auth.token);
      setSelectedEvent(createdEvent);
    } catch (error) {
      console.error("Create event error:", error);
      setStatus((current) => ({
        ...current,
        loading: false,
        error:
          error.message || "Failed to create event. Please check all fields.",
      }));
    }
  };

  return (
    <AuthGuard>
      <AppShell
        title="Events"
        description={
          adminMode
            ? "Admin event workspace with live event visibility and management-focused actions."
            : "Browse live event overviews, check details, and pick what you want to reserve next."
        }
      >
        {status.loading ? (
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Loading
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Preparing the events page...
            </h3>
          </section>
        ) : (
          <>
            <EventsHero
              adminMode={adminMode}
              eventCount={events.length}
              activeCount={activeCount}
            />

            {status.error ? (
              <p className="mt-6 rounded-2xl border border-[rgba(192,90,43,0.16)] bg-[rgba(192,90,43,0.08)] px-4 py-[0.9rem] text-[var(--accent-dark)]">
                {status.error}
              </p>
            ) : null}

            {adminMode ? (
              <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
                <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                  Create Event
                </p>
                <h3 className="mb-4 text-[1.1rem]">
                  Publish a new event listing
                </h3>
                <form
                  className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1"
                  onSubmit={handleCreateEvent}
                >
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    placeholder="Event name *"
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
                    placeholder="Venue *"
                    required
                    type="text"
                    value={createForm.venue}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        venue: event.target.value,
                      }))
                    }
                  />

                  <textarea
                    className="col-span-2 min-h-32 w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none max-[900px]:col-span-1"
                    placeholder="Event description *"
                    required
                    value={createForm.description}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    required
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={createForm.date}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />

                  <select
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    value={createForm.category}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="Concert">Concert</option>
                    <option value="Conference">Conference</option>
                    <option value="Sports">Sports</option>
                    <option value="Theater">Theater</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Other">Other</option>
                  </select>

                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    min="1"
                    placeholder="Total seats *"
                    required
                    type="number"
                    value={createForm.totalSeats}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        totalSeats: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    min="0"
                    step="0.01"
                    placeholder="Ticket price (LKR) *"
                    required
                    type="number"
                    value={createForm.ticketPrice}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        ticketPrice: event.target.value,
                      }))
                    }
                  />

                  {/* Image Upload Field */}
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                      Event Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-end gap-3 max-[900px]:col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateForm({
                          name: "",
                          description: "",
                          venue: "",
                          date: "",
                          totalSeats: "",
                          ticketPrice: "",
                          category: "Other",
                        });
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                    >
                      Clear
                    </button>
                    <button
                      className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={status.loading}
                    >
                      {status.loading ? "Creating..." : "Create Event"}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="mt-6 grid grid-cols-[1.35fr_0.65fr] gap-6 max-[1100px]:grid-cols-1">
              <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    adminMode={adminMode}
                    event={event}
                    onSelect={setSelectedEvent}
                  />
                ))}
              </div>

              <EventDetailPanel adminMode={adminMode} event={selectedEvent} />
            </section>
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}
