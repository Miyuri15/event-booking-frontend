"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchMyBookings,
  fetchEventsForBookingPage,
  bookEvent,
} from "@/lib/api";
import { getAuth } from "@/lib/auth";
import EventSelection from "./EventSelection";
import TicketSelection from "./TicketSelection";
import PaymentReview from "./PaymentReview";

const reservationSteps = [
  "Choose event",
  "Select seat count and attendee details",
  "Final review and confirm booking",
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getBookingEvent = (booking) => {
  return booking?.event || booking?.eventId || booking?.eventDetails || null;
};

const getBookingTitle = (booking) => {
  const eventDetails = getBookingEvent(booking);
  return (
    booking?.title ||
    booking?.name ||
    booking?.eventName ||
    eventDetails?.name ||
    eventDetails?.title ||
    "Untitled Event"
  );
};

const getBookingVenue = (booking) => {
  const eventDetails = getBookingEvent(booking);
  return booking?.venue || eventDetails?.venue || "Unknown Venue";
};

const getBookingDate = (booking) => {
  const eventDetails = getBookingEvent(booking);
  return (
    booking?.eventDate ||
    booking?.date ||
    eventDetails?.date ||
    eventDetails?.eventDate ||
    null
  );
};

const getBookingStatus = (booking) => {
  return booking?.status || booking?.paymentStatus || "Pending";
};

const getBookingTicketCount = (booking) => {
  return booking?.numberOfTickets || booking?.ticketCount || 0;
};

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsPageFallback />}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageFallback() {
  return (
    <AuthGuard>
      <AppShell
        title="Bookings"
        description="Manage reservations, preview the booking flow, and review the current state of your upcoming event purchases."
      >
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
          <p className="text-[var(--text-muted)]">Loading bookings...</p>
        </section>
      </AppShell>
    </AuthGuard>
  );
}

function BookingsPageContent() {
  const searchParams = useSearchParams();
  const [auth, setAuth] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [myBookings, setMyBookings] = useState(null);
  const [bookableEvents, setBookableEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isPlacingBooking, setIsPlacingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const loadBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const data = await fetchMyBookings(auth.token, {
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        setMyBookings(data);
        console.log("My bookings loaded:", data);
      } catch (error) {
        console.error("Error loading my bookings:", error.message);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();
  }, [auth]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const fetchEventData = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await fetchEventsForBookingPage(auth.token, {
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        if (response?.data) {
          const availableEvents = response.data.filter(
            (event) =>
              event.status === "Active" &&
              Number(event.availableSeats || 0) > 0,
          );
          setBookableEvents(availableEvents);
          if (availableEvents.length > 0) {
            const requestedEventId = searchParams.get("eventId");
            const preselectedEvent = requestedEventId
              ? availableEvents.find((event) => event._id === requestedEventId)
              : null;
            setSelectedEventId(preselectedEvent?._id || availableEvents[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEventData();
  }, [auth, searchParams]);

  useEffect(() => {
    if (!bookableEvents.length) return;

    const requestedEventId = searchParams.get("eventId");
    if (!requestedEventId) return;

    const preselectedEvent = bookableEvents.find(
      (event) => event._id === requestedEventId,
    );

    if (preselectedEvent) {
      setSelectedEventId(preselectedEvent._id);
      setShowModal(true);
      setStep(2);
    }
  }, [bookableEvents, searchParams]);

  const selectedEvent = useMemo(
    () =>
      bookableEvents.find((event) => event._id === selectedEventId) ||
      bookableEvents[0],
    [selectedEventId, bookableEvents],
  );

  // Calculate totals only if selectedEvent exists
  const subtotal = selectedEvent?.ticketPrice
    ? selectedEvent.ticketPrice * ticketCount
    : 0;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const openBookingFlow = () => {
    setStep(1);
    setShowModal(true);
  };

  const closeBookingFlow = () => {
    setShowModal(false);
  };

  const nextStep = () => {
    setStep((current) => Math.min(current + 1, 3));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const confirmBooking = async () => {
    if (!selectedEvent || !auth?.token) return;

    setIsPlacingBooking(true);
    try {
      await bookEvent(
        selectedEvent._id,
        {
          numberOfTickets: ticketCount,
        },
        auth.token,
      );

      const nextBooking = {
        title: selectedEvent.name,
        date: formatDate(selectedEvent.date),
        status: "Pending",
        numberOfTickets: ticketCount,
        venue: selectedEvent.venue,
      };

      setBookings((current) => [nextBooking, ...current]);
      setConfirmationMessage(
        `${selectedEvent.name} is booked for ${ticketCount} ticket(s). Booking placed successfully!`,
      );
      setShowModal(false);

      // Refresh my bookings
      const data = await fetchMyBookings(auth.token);
      setMyBookings(data);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingError(error.message || "Booking failed. Please try again.");
    } finally {
      setIsPlacingBooking(false);
    }
  };

  return (
    <AuthGuard>
      <AppShell
        title="Bookings"
        description="Manage reservations, preview the booking flow, and review the current state of your upcoming event purchases."
      >
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            My Reservations
          </p>
          <h3 className="mb-3 text-[1.05rem]">Current booking activity</h3>
          <div className="grid gap-4">
            {isLoadingBookings ? (
              // Loading skeletons for bookings
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                  >
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-[rgba(192,90,43,0.2)] rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-32 bg-[rgba(54,45,32,0.1)] rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-24 bg-[rgba(54,45,32,0.1)] rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-[rgba(54,45,32,0.1)] rounded animate-pulse"></div>
                      <div className="h-6 w-20 bg-[rgba(33,83,79,0.12)] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))
            ) : myBookings && myBookings.length > 0 ? (
              myBookings.map((booking) => (
                <article
                  className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                  key={booking?.id || booking?._id}
                >
                  <div className="flex-1">
                    <h4 className="mb-2 text-[1.15rem]">
                      {getBookingTitle(booking)}
                    </h4>
                    <p className="mb-0 text-[var(--text-muted)]">
                      {getBookingVenue(booking)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>
                      {getBookingDate(booking)
                        ? formatDate(getBookingDate(booking))
                        : "Date TBD"}
                    </span>
                    <strong>{getBookingTicketCount(booking)} ticket(s)</strong>
                    <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                      {getBookingStatus(booking)}
                    </span>
                    {getBookingStatus(booking).toLowerCase() === "pending" ? (
                      <Link
                        className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1rem] py-[0.65rem] text-[0.82rem] font-bold text-white shadow-[0_12px_26px_rgba(192,90,43,0.22)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                        href={`/payments?bookingId=${booking?._id || booking?.id}`}
                      >
                        Proceed to Payment
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] rounded-[20px] text-center">
                <p className="text-[var(--text-muted)] mb-4">
                  You haven't made any bookings yet.
                </p>
                <Link
                  href="/explore"
                  className="text-[var(--accent)] font-bold hover:underline"
                >
                  Explore Events
                </Link>
              </div>
            )}
          </div>
        </section>

        {showModal ? (
          <div
            className="fixed inset-0 z-30 grid place-items-center bg-[rgba(17,17,17,0.45)] p-4"
            onClick={closeBookingFlow}
            role="presentation"
          >
            <section
              className="max-h-[90vh] w-[min(920px,100%)] overflow-auto rounded-[28px] border border-[rgba(54,45,32,0.1)] bg-[#fffaf4] p-6 shadow-[0_30px_70px_rgba(17,17,17,0.22)]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 max-[900px]:grid-cols-1">
                <div>
                  <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                    Booking Portal
                  </p>
                  <h3 className="mb-3 text-[1.05rem]">Create reservation</h3>
                </div>
                <button
                  className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  onClick={closeBookingFlow}
                  type="button"
                >
                  Close
                </button>
              </div>

              {/* Steps indicator - updated to handle 3 steps correctly */}
              <div className="my-5 grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                {reservationSteps.map((label, index) => (
                  <div
                    className={
                      index + 1 <= step
                        ? "rounded-2xl border border-[rgba(192,90,43,0.15)] bg-[rgba(192,90,43,0.12)] px-[0.9rem] py-[0.8rem] text-[0.9rem] text-[var(--accent-dark)]"
                        : "rounded-2xl bg-[rgba(54,45,32,0.06)] px-[0.9rem] py-[0.8rem] text-[0.9rem] text-[var(--text-muted)]"
                    }
                    key={label}
                  >
                    {index + 1}. {label}
                  </div>
                ))}
              </div>

              {/* Show steps */}
              {step === 1 &&
                (isLoadingEvents ? (
                  <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.82)] p-4"
                        >
                          <div className="h-5 w-32 bg-[rgba(192,90,43,0.2)] rounded animate-pulse mb-2"></div>
                          <div className="h-4 w-24 bg-[rgba(54,45,32,0.1)] rounded animate-pulse mb-2"></div>
                          <div className="h-4 w-20 bg-[rgba(54,45,32,0.1)] rounded animate-pulse"></div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <EventSelection
                    bookableEvents={bookableEvents}
                    selectedEventId={selectedEventId}
                    setSelectedEventId={setSelectedEventId}
                  />
                ))}
              {step === 2 && (
                <TicketSelection
                  step={step}
                  ticketCount={ticketCount}
                  setTicketCount={setTicketCount}
                  selectedEvent={selectedEvent}
                />
              )}
              {step === 3 && (
                <PaymentReview
                  selectedEvent={selectedEvent}
                  total={total}
                  serviceFee={serviceFee}
                  ticketCount={ticketCount}
                  isProcessing={isPlacingBooking}
                  onConfirm={confirmBooking}
                />
              )}

              {/* Buttons for step navigation - updated for 3 steps */}
              <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4 max-[900px]:grid-cols-1">
                <button
                  className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={step === 1 || isPlacingBooking}
                  onClick={previousStep}
                  type="button"
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50"
                    onClick={nextStep}
                    disabled={
                      (step === 1 && (!selectedEventId || isLoadingEvents)) ||
                      isPlacingBooking
                    }
                    type="button"
                  >
                    {step === 1 && isLoadingEvents ? "Loading..." : "Continue"}
                  </button>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </AppShell>
      {bookingError ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-[rgba(17,17,17,0.45)] p-4"
          onClick={() => setBookingError("")}
          role="presentation"
        >
          <section
            className="max-h-[90vh] w-[min(560px,100%)] overflow-auto rounded-[28px] border border-[rgba(54,45,32,0.1)] bg-[#fffaf4] p-6 shadow-[0_30px_70px_rgba(17,17,17,0.22)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Booking Issue
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Booking could not be completed
            </h3>
            <p className="leading-[1.7] text-[var(--text-muted)]">
              {bookingError}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                onClick={() => setBookingError("")}
                type="button"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AuthGuard>
  );
}
