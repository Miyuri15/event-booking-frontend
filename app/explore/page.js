"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { fetchEvents } from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

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

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange("")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === ""
            ? "bg-[var(--accent)] text-white shadow-md"
            : "bg-[rgba(192,90,43,0.1)] text-[var(--accent-dark)] hover:bg-[rgba(192,90,43,0.2)]"
        }`}
      >
        All Events
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === category
              ? "bg-[var(--accent)] text-white shadow-md"
              : "bg-[rgba(192,90,43,0.1)] text-[var(--accent-dark)] hover:bg-[rgba(192,90,43,0.2)]"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function EventCard({ event, adminMode, onSelect }) {
  const isReserveDisabled =
    event.status !== "Active" || Number(event.availableSeats) <= 0;
  const eventImage = event.images?.[0]?.url || "/placeholder-event.jpg";

  return (
    <article className="group flex flex-col rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-white overflow-hidden shadow-[0_8px_20px_rgba(50,38,22,0.06)] transition-all duration-300 hover:shadow-[0_16px_35px_rgba(50,38,22,0.12)] hover:-translate-y-1">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={eventImage}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "/placeholder-event.jpg";
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              event.status === "Active"
                ? "bg-green-500 text-white"
                : event.status === "Completed"
                  ? "bg-gray-500 text-white"
                  : "bg-red-500 text-white"
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-flex rounded-full bg-[rgba(192,90,43,0.11)] px-2.5 py-1 text-xs font-bold text-[var(--accent-dark)]">
            {event.category || "Event"}
          </span>
        </div>

        <h4 className="mb-2 text-lg font-bold line-clamp-2">{event.name}</h4>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
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

          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
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
            <span>{formatEventDate(event.date)}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-[var(--accent)]">
                {formatPrice(event.ticketPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--text-muted)]">Seats</span>
              <p className="text-sm font-semibold">
                {event.availableSeats}/{event.totalSeats}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isReserveDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] text-white shadow-md hover:shadow-lg hover:-translate-y-px"
            }`}
            disabled={isReserveDisabled}
            type="button"
          >
            {isReserveDisabled ? "Unavailable" : "Reserve"}
          </button>
          <button
            className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-4 py-2 text-sm font-medium text-[var(--secondary)] transition-all hover:bg-[rgba(33,83,79,0.2)] hover:-translate-y-px"
            type="button"
            onClick={() => onSelect(event)}
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
      >
        Previous
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg transition-all ${
            currentPage === page
              ? "bg-[var(--accent)] text-white shadow-md"
              : "border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
      >
        Next
      </button>
    </div>
  );
}

export default function ExplorePage() {
  const [auth, setAuth] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });

  // Extract unique categories from events
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      events.map((event) => event.category).filter(Boolean),
    );
    return Array.from(uniqueCategories).sort();
  }, [events]);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      if (!auth?.token) {
        setStatus((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStatus({ loading: true, error: "" });

        const params = {
          status: "Active",
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const response = await fetchEvents(params, auth.token);
        console.log("Fetched events response:", response);

        // Handle paginated response
        let eventsData = [];
        let paginationData = null;

        if (response && response.data) {
          eventsData = response.data;
          paginationData = response.pagination;
        } else if (Array.isArray(response)) {
          eventsData = response;
        } else if (response && response.events) {
          eventsData = response.events;
          paginationData = response.pagination;
        } else {
          eventsData = [];
        }

        setEvents(eventsData);

        if (paginationData) {
          setTotalPages(paginationData.pages || 1);
          setTotalEvents(paginationData.total || 0);
        } else {
          setTotalPages(Math.ceil(eventsData.length / ITEMS_PER_PAGE));
          setTotalEvents(eventsData.length);
        }

        if (eventsData.length > 0 && !selectedEvent) {
          setSelectedEvent(eventsData[0]);
        }

        setStatus({ loading: false, error: "" });
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents([]);
        setStatus({
          loading: false,
          error: "Failed to load events. Please try again later.",
        });
      }
    };

    loadEvents();
  }, [auth, currentPage, selectedCategory]);

  const adminMode = useMemo(() => isAdmin(auth), [auth]);
  const activeCount = useMemo(
    () => events.filter((event) => event.status === "Active").length,
    [events],
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              eventCount={totalEvents}
              activeCount={activeCount}
            />

            {status.error && (
              <p className="mt-6 rounded-2xl border border-[rgba(192,90,43,0.16)] bg-[rgba(192,90,43,0.08)] px-4 py-[0.9rem] text-[var(--accent-dark)]">
                {status.error}
              </p>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mt-6">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            )}

            {/* Events Grid - 5 columns on desktop */}
            <section className="mt-6">
              {events.length === 0 ? (
                <div className="text-center py-12 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
                  <p className="text-[var(--text-muted)]">No events found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {events.map((event) => (
                      <EventCard
                        key={event._id}
                        adminMode={adminMode}
                        event={event}
                        onSelect={setSelectedEvent}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />

                  {/* Total events info */}
                  <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalEvents)} of{" "}
                    {totalEvents} events
                  </p>
                </>
              )}
            </section>
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}
