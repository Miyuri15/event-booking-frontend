"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicAppShell from "@/components/PublicAppShell";
import LoginPromptModal from "@/components/LoginPromptModal";
import { getAuth } from "@/lib/auth";
import { fetchEvents } from "@/lib/api";
import { useEffect, useState } from "react";

function formatPrice(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function formatEventDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function EventCard({ event, onBookClick }) {
  const eventImage = event.images?.[0]?.url || "/placeholder-event.jpg";
  const isSoldOut = event.availableSeats === 0;
  const isCompleted = event.status === "Completed";

  return (
    <article className="group flex min-h-[320px] flex-col rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-white overflow-hidden shadow-[0_16px_35px_rgba(50,38,22,0.06)] transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={eventImage}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/placeholder-event.jpg";
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-lg ${
              event.status === "Active" && !isSoldOut
                ? "bg-green-500 text-white"
                : isSoldOut
                  ? "bg-red-500 text-white"
                  : "bg-gray-500 text-white"
            }`}
          >
            {isSoldOut
              ? "Sold Out"
              : event.status === "Completed"
                ? "Completed"
                : "Active"}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <span className="mb-3 inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
          {event.category || "Event"}
        </span>
        <h4 className="mb-2 text-[1.15rem] font-bold line-clamp-1">
          {event.name}
        </h4>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)] mb-3">
            <span className="truncate">{event.venue}</span>
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[rgba(54,45,32,0.08)]">
            <strong className="text-lg text-[var(--accent)]">
              {formatPrice(event.ticketPrice)}
            </strong>
            <span className="text-xs text-[var(--text-muted)]">
              {event.availableSeats} seats left
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button
            className={`w-full cursor-pointer rounded-full px-[1.35rem] py-[0.95rem] text-white transition-all duration-200 ${
              isSoldOut || isCompleted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--accent)] to-[#d7834d] shadow-md hover:shadow-lg hover:-translate-y-px"
            }`}
            disabled={isSoldOut || isCompleted}
            onClick={() => onBookClick(event)}
            type="button"
          >
            {isSoldOut
              ? "Sold Out"
              : isCompleted
                ? "Completed"
                : "Reserve Seat"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);
  }, []);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        // Fetch upcoming active events (limit to 4)
        const response = await fetchEvents({
          status: "Active",
          limit: 4,
          page: 1,
        });

        const eventsData = response?.data || response || [];
        setFeaturedEvents(eventsData);
      } catch (error) {
        console.error("Failed to load events:", error);
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedEvents();
  }, []);

  const handleBookClick = (event) => {
    if (!auth?.token) {
      setSelectedEvent(event);
      setShowLoginPrompt(true);
    } else {
      router.push(`/explore`);
    }
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <PublicAppShell title="" description="">
        {/* Hero Section */}
        <section className="mb-12 grid grid-cols-[1.1fr_0.9fr] items-center gap-6 max-[900px]:grid-cols-1">
          <div>
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Live Experiences, Reimagined
            </p>
            <h1 className="mb-4 max-w-[720px] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95]">
              Find the next event worth leaving home for.
            </h1>
            <p className="max-w-[640px] leading-[1.7] text-[var(--text-muted)]">
              Browse standout concerts, startup meetups, creative workshops, and
              premium city events through a modern booking platform designed for
              fast discovery and smooth sign-in.
            </p>

            {!auth?.token && (
              <div className="flex flex-wrap gap-3 pt-4">
                <Link
                  className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  href="/auth"
                >
                  Sign In to Book
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-4 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Browse Mode
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.75rem] font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-bold">Browse Freely</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Explore events without signing in
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.75rem] font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-bold">Sign In to Book</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Create an account to reserve your spot
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.75rem] font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-bold">Manage Bookings</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Track and manage all your event reservations
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Featured Events
              </p>
              <h3 className="text-[1.2rem] font-semibold">
                Upcoming experiences you might like
              </h3>
            </div>
            <Link
              href="/explore"
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
            >
              View All Events →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--accent)] border-t-transparent"></div>
                <p className="mt-3 text-[var(--text-muted)]">
                  Loading events...
                </p>
              </div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)]">
                No upcoming events at the moment
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Check back later for new events
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onBookClick={handleBookClick}
                />
              ))}
            </div>
          )}
        </section>
      </PublicAppShell>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        eventTitle={selectedEvent?.name}
        onCancel={handleCloseLoginPrompt}
      />
    </>
  );
}
