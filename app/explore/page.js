"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import ConfirmationModal from "@/components/ConfirmationModal";
import { fetchEvents } from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";
import BookingModal from "@/components/booking/BookingModal";

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

function EventsHero({ adminMode, eventCount }) {
  return (
    <section className="grid grid-cols-[1.2fr_0.8fr] gap-6 max-[1000px]:grid-cols-1">
      {/* Main Hero Content */}
      <article className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-white p-8 shadow-lg backdrop-blur-[14px]">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          {adminMode ? "✨ Event Control" : "🎉 Explore Events"}
        </p>
        <h3 className="mb-3 text-[1.6rem] font-semibold">
          {adminMode
            ? "Monitor listings and keep the event catalog healthy."
            : "Browse the latest experiences and choose what you want to attend."}
        </h3>
        <p className="leading-[1.7] text-[var(--text-muted)]">
          {adminMode
            ? "This workspace keeps admin actions visible while still showing the same live event overview your users see."
            : "Discover amazing events happening near you. From concerts to conferences, find your next unforgettable experience."}
        </p>
      </article>

      {/* Snapshot Section */}
      <article className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-white p-8 shadow-lg backdrop-blur-[14px]">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          📊 Snapshot
        </p>
        <div className="grid grid-cols gap-4">
          <div className="rounded-[20px] bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center transition-transform hover:scale-105">
            <strong className="mb-2 block text-4xl font-bold text-[var(--accent)]">
              {eventCount}
            </strong>
            <span className="text-sm text-[var(--text-muted)]">
              Events available
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-main)]">
          Browse by Category
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onCategoryChange("")}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
          >
            Clear filter →
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategoryChange("")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === ""
              ? "bg-[var(--accent)] text-white shadow-md shadow-orange-200"
              : "bg-white border border-[rgba(54,45,32,0.12)] text-[var(--text-main)] hover:bg-gray-50 hover:shadow-md"
          }`}
        >
          All Events
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-[var(--accent)] text-white shadow-md shadow-orange-200"
                : "bg-white border border-[rgba(54,45,32,0.12)] text-[var(--text-main)] hover:bg-gray-50 hover:shadow-md"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventCard({ event, adminMode, onSelect, onBookNow }) {
  const isReserveDisabled =
    event.status !== "Active" || Number(event.availableSeats) <= 0;
  const eventImage = event.images?.[0]?.url || "/placeholder-event.jpg";
  const seatsPercentage = (event.availableSeats / event.totalSeats) * 100;

  const handleBookNow = () => {
    if (onBookNow && !isReserveDisabled) {
      onBookNow(event);
    }
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-[rgba(54,45,32,0.08)] bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      {/* Event Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
        {event.availableSeats <= 10 && event.availableSeats > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex rounded-full bg-red-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
              Only {event.availableSeats} seats left!
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <span className="inline-flex rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1 text-xs font-bold text-[var(--accent-dark)]">
            {event.category || "Event"}
          </span>
        </div>

        <h4 className="mb-2 text-xl font-bold text-[var(--text-main)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {event.name}
        </h4>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
          {event.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <svg
              className="w-4 h-4 flex-shrink-0"
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
              className="w-4 h-4 flex-shrink-0"
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

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--text-muted)]">
                Seats available
              </span>
              <span className="text-xs font-semibold">
                {event.availableSeats}/{event.totalSeats}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--accent)] to-orange-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${seatsPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-2xl font-bold text-[var(--accent)]">
                {formatPrice(event.ticketPrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            className={`flex-1 cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isReserveDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--accent)] to-[#d7834d] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            }`}
            disabled={isReserveDisabled}
            onClick={handleBookNow}
            type="button"
          >
            {isReserveDisabled ? "Unavailable" : "Book Now →"}
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
    <div className="flex justify-center items-center gap-2 mt-12 mb-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-5 py-2.5 rounded-xl border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium shadow-sm"
      >
        ← Previous
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[42px] px-3 py-2.5 rounded-xl transition-all font-medium ${
            currentPage === page
              ? "bg-gradient-to-r from-[var(--accent)] to-[#d7834d] text-white shadow-md"
              : "border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-5 py-2.5 rounded-xl border border-[rgba(54,45,32,0.16)] bg-white text-[var(--text-main)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium shadow-sm"
      >
        Next →
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
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
  const [bookingFeedback, setBookingFeedback] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  const handleBookNow = (event) => {
    setSelectedEventForBooking(event);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async (eventName, ticketCount) => {
    setBookingFeedback({
      isOpen: true,
      title: "Booking created successfully",
      description: `${ticketCount} ticket(s) for ${eventName} were added to your reservations. You can continue to payments from My Reservations.`,
    });
    console.log(`Successfully booked ${ticketCount} tickets for ${eventName}`);

    if (!auth?.token) return;

    try {
      const response = await fetchEvents(
        {
          status: "Active",
          page: currentPage,
          ...(selectedCategory ? { category: selectedCategory } : {}),
        },
        auth.token,
      );

      if (response && response.data && Array.isArray(response.data)) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh events after booking:", error);
    }
  };

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
        };

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const response = await fetchEvents(params, auth.token);

        // Handle paginated response
        let eventsData = [];
        let paginationData = null;

        if (response && response.data && Array.isArray(response.data)) {
          eventsData = response.data;
          paginationData = response.pagination;
        } else if (
          response &&
          response.events &&
          Array.isArray(response.events)
        ) {
          eventsData = response.events;
          paginationData = response.pagination;
        } else if (Array.isArray(response)) {
          eventsData = response;
          paginationData = null;
        } else {
          eventsData = [];
        }

        setEvents(eventsData);

        if (paginationData) {
          setTotalPages(paginationData.pages || 1);
          setTotalEvents(paginationData.total || 0);
          setItemsPerPage(paginationData.limit || 9);
        } else {
          const calculatedPages = Math.ceil(eventsData.length / 9);
          setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
          setTotalEvents(eventsData.length);
          setItemsPerPage(9);
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalEvents);

  return (
    <AuthGuard>
      <AppShell
        title="Events"
        description={
          adminMode
            ? "Admin event workspace with live event visibility and management-focused actions."
            : "Discover and book amazing events. Find concerts, conferences, and more."
        }
      >
        {status.loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
              <p className="mt-4 text-[var(--text-muted)]">
                Loading amazing events...
              </p>
            </div>
          </div>
        ) : (
          <>
            <EventsHero adminMode={adminMode} eventCount={totalEvents} />

            {status.error && (
              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
                <p className="text-orange-700">⚠️ {status.error}</p>
              </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mt-8">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            )}

            {/* Events Grid - 3 columns */}
            <section className="mt-6">
              {events.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]">
                  <div className="text-6xl mb-4">🎭</div>
                  <p className="text-lg text-[var(--text-muted)]">
                    No events found
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Try selecting a different category or check back later.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {events.map((event) => (
                      <EventCard
                        key={event._id}
                        adminMode={adminMode}
                        event={event}
                        onSelect={setSelectedEvent}
                        onBookNow={handleBookNow}
                      />
                    ))}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                      <div className="text-center">
                        <p className="text-sm text-[var(--text-muted)] bg-gray-50 inline-block px-4 py-2 rounded-full">
                          Showing {startItem} - {endItem} of {totalEvents}{" "}
                          events
                        </p>
                      </div>
                    </>
                  )}

                  {/* Show when only one page */}
                  {totalPages === 1 && totalEvents > 0 && (
                    <div className="text-center mt-6">
                      <p className="text-sm text-[var(--text-muted)] bg-gray-50 inline-block px-4 py-2 rounded-full">
                        🎉 Showing all {totalEvents} amazing events
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          preselectedEventId={selectedEventForBooking?._id}
          onBookingSuccess={handleBookingSuccess}
        />
        <ConfirmationModal
          isOpen={bookingFeedback.isOpen}
          title={bookingFeedback.title}
          description={bookingFeedback.description}
          confirmLabel="View Reservations"
          cancelLabel="Keep Browsing"
          onConfirm={() => {
            setBookingFeedback({
              isOpen: false,
              title: "",
              description: "",
            });
            window.location.href = "/bookings";
          }}
          onCancel={() =>
            setBookingFeedback({
              isOpen: false,
              title: "",
              description: "",
            })
          }
        />
      </AppShell>
    </AuthGuard>
  );
}
