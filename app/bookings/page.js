"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useMemo, useState, useEffect } from "react";
import { fetchMyBookings, fetchEventsForBookingPage } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import EventSelection from "./EventSelection";
import TicketSelection from "./TicketSelection";
import BookingReview from "./BookingReview";
import PaymentReview from "./PaymentReview";

const reservationSteps = [
  "Choose event", // Removed "and ticket tier"
  "Select seat count and attendee details",
  "Confirm booking summary",
  "Proceed to payment and receive ticket",
];

export default function BookingsPage() {
  const [auth, setAuth] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null); // Initially no event selected
  const [ticketCount, setTicketCount] = useState(2);
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [myBookings, setMyBookings] = useState(null);
  const [bookableEvents, setBookableEvents] = useState([]); // State to store events

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    // Load my bookings
    const loadBookings = async () => {
      try {
        const data = await fetchMyBookings(auth.token);
        setMyBookings(data);
      } catch (error) {
        console.error("Error loading my bookings:", error.message);
      }
    };

    loadBookings();
  }, [auth]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const fetchEventData = async () => {
      try {
        const response = await fetchEventsForBookingPage(auth.token); // API call to fetch events
        if (response?.data) {
          setBookableEvents(response.data); // Update state with the fetched events
          if (response.data.length > 0) {
            setSelectedEventId(response.data[0]._id); // Set the first event as the selected one
            console.log("Fetched events:", response.data); // Log the fetched events for debugging
            // setted first event
            console.log("Selected event set to:", response.data[0]); // Log the selected event for debugging
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);
      }
    };

    fetchEventData();
  }, [auth]);

  const selectedEvent = useMemo(
    () =>
      bookableEvents.find((event) => event._id === selectedEventId) ||
      bookableEvents[0], // If no event is selected, select the first one by default
    [selectedEventId, bookableEvents],
  );

  const subtotal = selectedEvent?.ticketPrice * ticketCount;
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
    setStep((current) => Math.min(current + 1, 4));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const confirmBooking = () => {
    const nextBooking = {
      title: selectedEvent.name,
      date: selectedEvent.date,
      status: "Confirmed",
      numberOfTickets: ticketCount,
      venue: selectedEvent.venue,
    };

    setBookings((current) => [nextBooking, ...current]);
    setConfirmationMessage(
      `${selectedEvent.name} is booked for ${ticketCount} ticket(s).`,
    );
    setShowModal(false);
  };

  return (
    <AuthGuard>
      <AppShell
        title="Bookings"
        description="Manage reservations, preview the booking flow, and review the current state of your upcoming event purchases."
      >
        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          {/* Booking Flow Section */}
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Booking Flow
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              How reservations move through the platform
            </h3>
            <div className="grid gap-4">
              {reservationSteps.map((label) => (
                <div
                  className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                  key={label}
                >
                  <span className="mt-[0.45rem] h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
                  <div>
                    <strong>{label}</strong>
                    <p className="mb-0 text-[var(--text-muted)]">
                      Designed as a smooth, low-friction booking journey.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Booking Summary Section */}
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Reserve Quickly
            </p>
            <h3 className="mb-3 text-[1.05rem]">Booking summary preview</h3>
            <div className="grid gap-4">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Selected Event</span>
                <strong>{selectedEvent?.name}</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Estimated Total</span>
                <strong>LKR {total.toLocaleString()}</strong>
              </div>
            </div>
            {confirmationMessage ? (
              <p className="mt-4 rounded-2xl border border-[rgba(47,125,83,0.18)] bg-[rgba(47,125,83,0.08)] px-4 py-[0.9rem] text-[var(--success)]">
                {confirmationMessage}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                onClick={openBookingFlow}
                type="button"
              >
                Start Booking
              </button>
              <button
                className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                type="button"
              >
                View Seat Map
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            My Reservations
          </p>
          <h3 className="mb-3 text-[1.05rem]">Current booking activity</h3>
          <div className="grid gap-4">
            {myBookings?.map((booking) => (
              <article
                className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                key={booking?.id}
              >
                <div>
                  <h4 className="mb-2 text-[1.15rem]">{booking.title}</h4>
                  <p className="mb-0 text-[var(--text-muted)]">
                    {booking?.venue || "Unknown Venue"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span>{booking?.date}</span>
                  <strong>{booking?.numberOfTickets} ticket(s)</strong>
                  <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                    {booking?.status}
                  </span>
                </div>
              </article>
            ))}
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

              {/* Steps 1-4 */}
              <div className="my-5 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
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
              {step === 1 && (
                <EventSelection
                  bookableEvents={bookableEvents}
                  selectedEventId={selectedEventId}
                  setSelectedEventId={setSelectedEventId}
                />
              )}
              {step === 2 && (
                <TicketSelection
                  step={step}
                  ticketCount={ticketCount}
                  setTicketCount={setTicketCount}
                  selectedEvent={selectedEvent}
                />
              )}
              {step === 3 && (
                <BookingReview
                  selectedEvent={selectedEvent}
                  ticketCount={ticketCount}
                  total={total}
                />
              )}
              {step === 4 && (
                <PaymentReview selectedEvent={selectedEvent} total={total} />
              )}

              {/* Buttons for step navigation */}
              <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4 max-[900px]:grid-cols-1">
                <button
                  className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  disabled={step === 1}
                  onClick={previousStep}
                  type="button"
                >
                  Back
                </button>
                {step < 4 ? (
                  <button
                    className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                    onClick={nextStep}
                    type="button"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                    onClick={confirmBooking}
                    type="button"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </AppShell>
    </AuthGuard>
  );
}
