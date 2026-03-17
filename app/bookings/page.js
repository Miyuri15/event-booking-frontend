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
    () => bookableEvents.find((event) => event.id === selectedEventId) || bookableEvents[0],
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
        <section className="workspace-grid">
          <article className="panel">
            <p className="eyebrow">Booking Flow</p>
            <h3>How reservations move through the platform</h3>
            <div className="timeline-list">
              {reservationSteps.map((step) => (
                <div className="timeline-item" key={step}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{step}</strong>
                    <p>Designed as a smooth, low-friction booking journey.</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Reserve Quickly</p>
            <h3>Booking summary preview</h3>
            <div className="summary-stack">
              <div className="summary-card">
                <span>Selected Event</span>
                <strong>{selectedEvent.title}</strong>
              </div>
              <div className="summary-card">
                <span>Ticket Tier</span>
                <strong>{selectedEvent.ticketTier}</strong>
              </div>
              <div className="summary-card">
                <span>Estimated Total</span>
                <strong>LKR {total.toLocaleString()}</strong>
              </div>
            </div>
            {confirmationMessage ? (
              <p className="status success">{confirmationMessage}</p>
            ) : null}
            <div className="hero-actions">
              <button className="primary-button" onClick={openBookingFlow} type="button">
                Start Booking
              </button>
              <button className="secondary-button" type="button">
                View Seat Map
              </button>
            </div>
          </article>
        </section>

        <section className="panel">
          <p className="eyebrow">My Reservations</p>
          <h3>Current booking activity</h3>
          <div className="ticket-list">
            {bookings.map((booking) => (
              <article className="ticket-card" key={booking.title}>
                <div>
                  <h4>{booking.title}</h4>
                  <p>{booking.venue}</p>
                </div>
                <div className="ticket-meta">
                  <span>{booking.date}</span>
                  <strong>{booking.tickets} ticket(s)</strong>
                  <span className="status-pill">{booking.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {showModal ? (
          <div className="modal-backdrop" onClick={closeBookingFlow} role="presentation">
            <section
              className="modal-card"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-header">
                <div>
                  <p className="eyebrow">Booking Portal</p>
                  <h3>Create reservation</h3>
                </div>
                <button className="secondary-button" onClick={closeBookingFlow} type="button">
                  Close
                </button>
              </div>

              <div className="step-indicator">
                {reservationSteps.map((label, index) => (
                  <div
                    className={index + 1 <= step ? "step-pill active-step-pill" : "step-pill"}
                    key={label}
                  >
                    {index + 1}. {label}
                  </div>
                ))}
              </div>

              {step === 1 ? (
                <div className="modal-grid">
                  {bookableEvents.map((event) => (
                    <button
                      className={
                        event.id === selectedEventId
                          ? "selection-card active-selection-card"
                          : "selection-card"
                      }
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      type="button"
                    >
                      <span className="event-category">{event.ticketTier}</span>
                      <h4>{event.title}</h4>
                      <p>{event.venue}</p>
                      <strong>{event.date}</strong>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="modal-form">
                  <label>
                    Number of Tickets
                    <input
                      max="6"
                      min="1"
                      onChange={(event) =>
                        setTicketCount(Number(event.target.value) || 1)
                      }
                      type="number"
                      value={ticketCount}
                    />
                  </label>

                  <div className="summary-stack">
                    <div className="summary-card">
                      <span>Ticket Price</span>
                      <strong>LKR {selectedEvent.price.toLocaleString()}</strong>
                    </div>
                    <div className="summary-card">
                      <span>Seats</span>
                      <strong>{ticketCount}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="summary-stack">
                  <div className="summary-card">
                    <span>Event</span>
                    <strong>{selectedEvent.title}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Venue</span>
                    <strong>{selectedEvent.venue}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Total Due</span>
                    <strong>LKR {total.toLocaleString()}</strong>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="summary-stack">
                  <div className="summary-card">
                    <span>Ready For Payment</span>
                    <strong>{selectedEvent.title}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Amount</span>
                    <strong>LKR {total.toLocaleString()}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Status</span>
                    <strong>Reservation locked for checkout</strong>
                  </div>
                </div>
              ) : null}

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  disabled={step === 1}
                  onClick={previousStep}
                  type="button"
                >
                  Back
                </button>
                {step < 4 ? (
                  <button className="primary-button" onClick={nextStep} type="button">
                    Continue
                  </button>
                ) : (
                  <button className="primary-button" onClick={confirmBooking} type="button">
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
