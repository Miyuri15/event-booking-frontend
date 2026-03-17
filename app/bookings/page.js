"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useMemo, useState } from "react";

const initialBookings = [
  {
    title: "Pulse Arena Live",
    date: "April 28, 8:00 PM",
    status: "Confirmed",
    tickets: 2,
    venue: "Colombo Arena",
  },
  {
    title: "Future of Product Asia",
    date: "May 03, 9:00 AM",
    status: "Pending Payment",
    tickets: 1,
    venue: "Hilton Colombo",
  },
];

const reservationSteps = [
  "Choose event and ticket tier",
  "Select seat count and attendee details",
  "Confirm booking summary",
  "Proceed to payment and receive ticket",
];

const bookableEvents = [
  {
    id: "evt-001",
    title: "Neon Harbor Music Night",
    venue: "Port City Arena",
    date: "May 11, 8:00 PM",
    ticketTier: "Premium Floor",
    price: 7500,
  },
  {
    id: "evt-002",
    title: "Design Futures Summit",
    venue: "Colombo Innovation Hall",
    date: "May 18, 9:00 AM",
    ticketTier: "Delegate Pass",
    price: 12000,
  },
  {
    id: "evt-003",
    title: "Lanterns and Jazz Evening",
    venue: "Independence Arcade",
    date: "May 24, 7:30 PM",
    ticketTier: "Garden Seating",
    price: 5400,
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedEventId, setSelectedEventId] = useState(bookableEvents[0].id);
  const [ticketCount, setTicketCount] = useState(2);
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const selectedEvent = useMemo(
    () =>
      bookableEvents.find((event) => event.id === selectedEventId) ||
      bookableEvents[0],
    [selectedEventId],
  );

  const subtotal = selectedEvent.price * ticketCount;
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
      title: selectedEvent.title,
      date: selectedEvent.date,
      status: "Confirmed",
      tickets: ticketCount,
      venue: selectedEvent.venue,
    };

    setBookings((current) => [nextBooking, ...current]);
    setConfirmationMessage(
      `${selectedEvent.title} is booked for ${ticketCount} ticket(s).`,
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

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Reserve Quickly
            </p>
            <h3 className="mb-3 text-[1.05rem]">Booking summary preview</h3>
            <div className="grid gap-4">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Selected Event</span>
                <strong>{selectedEvent.title}</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Ticket Tier</span>
                <strong>{selectedEvent.ticketTier}</strong>
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
            {bookings.map((booking) => (
              <article
                className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                key={booking.title}
              >
                <div>
                  <h4 className="mb-2 text-[1.15rem]">{booking.title}</h4>
                  <p className="mb-0 text-[var(--text-muted)]">
                    {booking.venue}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span>{booking.date}</span>
                  <strong>{booking.tickets} ticket(s)</strong>
                  <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                    {booking.status}
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

              {step === 1 ? (
                <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                  {bookableEvents.map((event) => (
                    <button
                      className={
                        event.id === selectedEventId
                          ? "w-full cursor-pointer rounded-[20px] border border-[rgba(192,90,43,0.35)] bg-[rgba(255,255,255,0.82)] p-4 text-left shadow-[0_0_0_4px_rgba(192,90,43,0.08)]"
                          : "w-full cursor-pointer rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.82)] p-4 text-left"
                      }
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      type="button"
                    >
                      <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
                        {event.ticketTier}
                      </span>
                      <h4 className="mb-2 text-[1.15rem]">{event.title}</h4>
                      <p className="mb-0 text-[var(--text-muted)]">
                        {event.venue}
                      </p>
                      <strong>{event.date}</strong>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4">
                  <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
                    <span>Number of Tickets</span>
                    <input
                      className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                      max="6"
                      min="1"
                      onChange={(event) =>
                        setTicketCount(Number(event.target.value) || 1)
                      }
                      type="number"
                      value={ticketCount}
                    />
                  </label>

                  <div className="grid gap-4">
                    <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                      <span>Ticket Price</span>
                      <strong>
                        LKR {selectedEvent.price.toLocaleString()}
                      </strong>
                    </div>
                    <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                      <span>Seats</span>
                      <strong>{ticketCount}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Event</span>
                    <strong>{selectedEvent.title}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Venue</span>
                    <strong>{selectedEvent.venue}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Total Due</span>
                    <strong>LKR {total.toLocaleString()}</strong>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-4">
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Ready For Payment</span>
                    <strong>{selectedEvent.title}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Amount</span>
                    <strong>LKR {total.toLocaleString()}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Status</span>
                    <strong>Reservation locked for checkout</strong>
                  </div>
                </div>
              ) : null}

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
