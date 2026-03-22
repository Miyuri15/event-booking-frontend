"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { fetchMyBookings, fetchEventsForBookingPage } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import EventSelection from "./EventSelection";
import TicketSelection from "./TicketSelection";
import PaymentReview from "./PaymentReview";

// --- Helpers & Sub-components ---
const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const normalizeBooking = (b) => {
  const event = b?.event || b?.eventId || b?.eventDetails || {};
  return {
    id: b?._id || b?.id,
    title:
      b?.eventName || b?.title || b?.name || event?.name || "Untitled Event",
    venue: b?.venue || event?.venue || "Unknown Venue",
    date: b?.eventDate || b?.date || event?.date,
    status: (b?.status || b?.paymentStatus || "Pending").toUpperCase(),
    tickets: b?.numberOfTickets || b?.ticketCount || 0,
    total: b?.totalAmount || 0,
    userName: b?.userName || "Guest",
    createdAt: b?.createdAt,
  };
};

// New Component for Single Booking View
const SingleBookingDetails = ({ booking, onClose }) => {
  const item = normalizeBooking(booking);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-black/5 pb-4">
        <h3 className="text-xl font-bold text-[var(--secondary)]">
          Reservation Details
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
        >
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 max-[600px]:grid-cols-1">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
            Event
          </p>
          <p className="font-medium text-lg">{item.title}</p>
          <p className="text-sm text-gray-500">{item.venue}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
            Attendee
          </p>
          <p className="font-medium">{item.userName}</p>
          <p className="text-sm text-gray-500">
            Booked on {formatDate(item.createdAt)}
          </p>
        </div>
      </div>

      <div className="bg-white/50 rounded-2xl p-4 border border-black/5">
        <div className="flex justify-between mb-2">
          <span>Tickets:</span>
          <span className="font-bold">{item.tickets}</span>
        </div>
        <div className="flex justify-between text-lg border-t border-dashed border-black/10 pt-2 mt-2">
          <span className="font-bold">Total Paid:</span>
          <span className="font-bold text-[var(--accent)]">
            Rs. {item.total}
          </span>
        </div>
      </div>

      {item.status === "PENDING" && (
        <Link
          href={`/payments?bookingId=${item.id}`}
          className="block text-center w-full py-4 bg-accent text-white rounded-full font-bold shadow-lg"
        >
          Complete Payment Now
        </Link>
      )}
    </div>
  );
};

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageFallback() {
  return (
    <AuthGuard>
      <AppShell title="Bookings" description="Loading your reservations...">
        <div className="p-8 animate-pulse text-[var(--text-muted)]">
          Loading bookings...
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function BookingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [bookableEvents, setBookableEvents] = useState([]);
  const [viewingBooking, setViewingBooking] = useState(null); // For the "View" functionality
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    bookings: true,
    events: true,
    placing: false,
  });

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token) return;

    const initData = async () => {
      try {
        const [bookingsRes, eventsRes] = await Promise.all([
          fetchMyBookings(auth.token, {
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          fetchEventsForBookingPage(auth.token),
        ]);

        const bookings = bookingsRes || [];
        setMyBookings(bookings);

        const activeEvents = (eventsRes?.data || []).filter(
          (e) => e.status === "Active" && e.availableSeats > 0,
        );
        setBookableEvents(activeEvents);

        // 1. Handle "View Single Booking" from URL
        const viewId = searchParams.get("id");
        if (viewId) {
          const found = bookings.find((b) => (b._id || b.id) === viewId);
          if (found) setViewingBooking(found);
        }

        // 2. Handle "New Booking" from URL
        const eventId = searchParams.get("eventId");
        if (eventId) {
          setSelectedEventId(eventId);
          setShowModal(true);
          setStep(2);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading({ bookings: false, events: false, placing: false });
      }
    };

    initData();
  }, [auth, searchParams]);

  const clearQuery = () => router.replace("/bookings");

  return (
    <AuthGuard>
      <AppShell title="Bookings" description="Manage your reservations.">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
          <h3 className="mb-6 text-[1.05rem] font-bold">
            Current booking activity
          </h3>

          <div className="grid gap-4">
            {myBookings.map((b) => {
              const item = normalizeBooking(b);
              return (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 rounded-[20px] border border-black/5 bg-white/60 p-4"
                >
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.venue}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatDate(item.date)}
                    </span>
                    <strong>{item.tickets} ticket(s)</strong>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => setViewingBooking(b)}
                      className="px-4 py-1.5 text-xs font-bold bg-white border border-black/10 hover:bg-gray-50 rounded-full transition-all"
                    >
                      View
                    </button>
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      Rs. {item.total}
                    </p>
                    {item.status === "PENDING" && (
                      <Link
                        href={`/payments?bookingId=${item.id}`}
                        className="px-4 py-1.5 text-xs font-bold bg-accent text-white rounded-full"
                      >
                        Pay
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Modal for Single Booking View */}
        {viewingBooking && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => {
              setViewingBooking(null);
              clearQuery();
            }}
          >
            <div
              className="w-full max-w-lg bg-[#fffaf4] rounded-[32px] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SingleBookingDetails
                booking={viewingBooking}
                onClose={() => setViewingBooking(null)}
              />
              <button
                onClick={() => {
                  setViewingBooking(null);
                  clearQuery();
                }}
                className="mt-4 w-full py-3 text-gray-500 font-medium hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Create Booking Modal (Existing Logic) */}
        {showModal && (
          <div
            className="fixed inset-0 z-30 grid place-items-center bg-black/45 p-4"
            onClick={() => setShowModal(false)}
          >
            <section
              className="max-h-[90vh] w-full max-w-[920px] overflow-auto rounded-[28px] bg-[#fffaf4] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase text-accent-dark">
                    Booking Portal
                  </p>
                  <h3 className="text-lg">Create reservation</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-secondary/10 text-secondary rounded-full"
                >
                  Close
                </button>
              </div>

              <StepIndicator currentStep={step} />

              <div className="min-h-[300px]">
                {step === 1 && (
                  <EventSelection
                    bookableEvents={bookableEvents}
                    selectedEventId={selectedEventId}
                    setSelectedEventId={setSelectedEventId}
                  />
                )}
                {step === 2 && (
                  <TicketSelection
                    ticketCount={ticketCount}
                    setTicketCount={setTicketCount}
                    selectedEvent={selectedEvent}
                  />
                )}
                {step === 3 && (
                  <PaymentReview
                    selectedEvent={selectedEvent}
                    total={totals.total}
                    serviceFee={totals.fee}
                    ticketCount={ticketCount}
                    isProcessing={loading.placing}
                    onConfirm={handleBooking}
                  />
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  disabled={step === 1 || loading.placing}
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 border border-secondary/20 rounded-full disabled:opacity-30"
                >
                  Back
                </button>
                {step < 3 && (
                  <button
                    disabled={!selectedEventId || loading.placing}
                    onClick={() => setStep((s) => s + 1)}
                    className="px-6 py-3 bg-accent text-white rounded-full shadow-lg"
                  >
                    Continue
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
