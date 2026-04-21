// components/BookingModal.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchEventsForBookingPage, bookEvent } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import EventSelection from "@/app/bookings/EventSelection";
import TicketSelection from "@/app/bookings/TicketSelection";
import PaymentReview from "@/app/bookings/PaymentReview";
import ConfirmationModal from "@/components/ConfirmationModal";

const reservationSteps = [
  "Choose event",
  "Select seat count and attendee details",
  "Final review and confirm booking",
];

function getEventId(event) {
  return event?._id || event?.id || null;
}

function normalizeId(value) {
  return value == null ? null : String(value);
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedEventId,
  preselectedEvent,
  onBookingSuccess,
}) {
  const [auth, setAuth] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketCount, setTicketCount] = useState(2);
  const [bookableEvents, setBookableEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isPlacingBooking, setIsPlacingBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedPreselectedId = normalizeId(
    preselectedEventId || getEventId(preselectedEvent),
  );
  const hasPreselectedEvent = !!normalizedPreselectedId || !!preselectedEvent;

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedEventId(normalizedPreselectedId);
    setStep(hasPreselectedEvent ? 2 : 1);
  }, [isOpen, normalizedPreselectedId, hasPreselectedEvent]);

  useEffect(() => {
    if (!auth?.token || !isOpen) return;

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

          if (normalizedPreselectedId) {
            const matched = availableEvents.find(
              (event) =>
                normalizeId(getEventId(event)) === normalizedPreselectedId,
            );

            if (matched) {
              setSelectedEventId(normalizedPreselectedId);
            }
          } else if (availableEvents.length > 0) {
            setSelectedEventId((current) => {
              if (current) return current;
              return normalizeId(getEventId(availableEvents[0]));
            });
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error.message);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEventData();
  }, [auth, isOpen, normalizedPreselectedId]);

  useEffect(() => {
    if (!isOpen) {
      setTicketCount(2);
      setErrorMessage("");
    }
  }, [isOpen, hasPreselectedEvent]);

  const selectedEvent = useMemo(() => {
    const matchedEvent = bookableEvents.find(
      (event) => normalizeId(getEventId(event)) === selectedEventId,
    );

    if (matchedEvent) {
      return matchedEvent;
    }

    if (hasPreselectedEvent && preselectedEvent) {
      return preselectedEvent;
    }

    return null;
  }, [selectedEventId, bookableEvents, hasPreselectedEvent, preselectedEvent]);

  const subtotal = selectedEvent?.ticketPrice
    ? selectedEvent.ticketPrice * ticketCount
    : 0;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

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
      const bookingEventId = getEventId(selectedEvent);
      if (!bookingEventId) {
        throw new Error("Event ID is not available for booking.");
      }

      await bookEvent(
        bookingEventId,
        { numberOfTickets: ticketCount },
        auth.token,
      );

      if (onBookingSuccess) {
        onBookingSuccess(selectedEvent.name, ticketCount);
      }

      onClose();
    } catch (error) {
      console.error("Booking failed:", error);
      setErrorMessage(error.message || "Booking failed. Please try again.");
    } finally {
      setIsPlacingBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-[rgba(17,17,17,0.45)] p-4"
      onClick={onClose}
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
            <h3 className="mb-3 text-[1.05rem]">
              {hasPreselectedEvent
                ? "Complete Your Booking"
                : "Create reservation"}
            </h3>
          </div>
          <button
            className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {/* Only show steps indicator if no preselected event */}
        {!hasPreselectedEvent && (
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
        )}

        {hasPreselectedEvent && selectedEvent && (
          <div className="mb-6 rounded-[20px] border border-[rgba(192,90,43,0.35)] bg-[rgba(255,255,255,0.82)] p-4">
            <h4 className="mb-2 text-[1.15rem] font-semibold">
              {selectedEvent.name}
            </h4>
            <p className="mb-1 text-[var(--text-muted)]">
              {selectedEvent.venue}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Step content */}
        {!hasPreselectedEvent &&
          step === 1 &&
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

        {step === 2 && selectedEvent && (
          <TicketSelection
            step={step}
            ticketCount={ticketCount}
            setTicketCount={setTicketCount}
            selectedEvent={selectedEvent}
          />
        )}

        {step === 2 && !selectedEvent && (
          <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.75)] p-4 text-[var(--text-muted)]">
            Loading event details...
          </div>
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

        {/* Navigation buttons */}
        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4 max-[900px]:grid-cols-1">
          <button
            className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(step === 1 && !hasPreselectedEvent) || isPlacingBooking}
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
                (!hasPreselectedEvent &&
                  step === 1 &&
                  (!selectedEventId || isLoadingEvents)) ||
                (step === 2 && !selectedEvent) ||
                isPlacingBooking
              }
              type="button"
            >
              Continue
            </button>
          ) : null}
        </div>
        <ConfirmationModal
          isOpen={Boolean(errorMessage)}
          title="Booking could not be completed"
          description={errorMessage}
          confirmLabel="Close"
          cancelLabel="Dismiss"
          onConfirm={() => setErrorMessage("")}
          onCancel={() => setErrorMessage("")}
        />
      </section>
    </div>
  );
}
