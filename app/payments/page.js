"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createStripeCheckoutSession,
  fetchPendingBookings,
  fetchBookingById,
  fetchRecentPayments,
} from "@/lib/api";
import { getAuth } from "@/lib/auth";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsPageFallback />}>
      <PaymentsPageContent />
    </Suspense>
  );
}

function PaymentsPageFallback() {
  return (
    <AuthGuard>
      <AppShell
        title="Payments"
        description="Handle checkout, saved payment methods, and transaction visibility in a dedicated payment portal."
      >
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px]">
          <div className="h-40 flex items-center justify-center">
             <p className="text-[var(--text-muted)] animate-pulse">Loading payment portal...</p>
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}

function PaymentsPageContent() {
  // 1. Stable Auth & Token Retrieval
  const auth = useMemo(() => (typeof window !== "undefined" ? getAuth() : null), []);
  const user = auth?.user || null;
  const token = auth?.token || null;

  const searchParams = useSearchParams();
  const bookingIdFromQuery = searchParams?.get("bookingId");

  const [selectedMethod, setSelectedMethod] = useState("Primary Card");
  const [promoCode, setPromoCode] = useState("");
  const [checkoutState, setCheckoutState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [booking, setBooking] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoadingRecentPayments, setIsLoadingRecentPayments] = useState(false);

  // 2. Load Specific Booking (using stable token)
  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingIdFromQuery || !token) return;
      setIsLoadingBooking(true);
      try {
        const data = await fetchBookingById(bookingIdFromQuery, token);
        const raw = data || {};
        const eventObj = raw.event || raw.eventDetails || {};
        const numberOfTickets = raw.numberOfTickets || raw.ticketCount || raw.quantity || 1;
        const ticketPrice = raw.ticketPrice || raw.price || eventObj.ticketPrice || eventObj.price || null;
        const subtotal = raw.subtotal || raw.totalAmount || (ticketPrice ? ticketPrice * numberOfTickets : raw.totalAmount) || 0;
        const serviceFee = raw.serviceFee || Math.round(subtotal * 0.1);
        const totalAmount = raw.totalAmount || subtotal + serviceFee;

        setBooking({
          id: raw._id || raw.id,
          eventName: raw.eventName || raw.title || eventObj.name || eventObj.title,
          numberOfTickets,
          ticketPrice,
          subtotal,
          serviceFee,
          totalAmount,
          venue: raw.venue || eventObj.venue,
          eventDate: raw.eventDate || raw.date || eventObj.date || eventObj.eventDate,
        });
      } catch (err) {
        console.error("Failed to load booking:", err);
        setErrorMessage("Failed to load booking details.");
      } finally {
        setIsLoadingBooking(false);
      }
    };
    loadBooking();
  }, [bookingIdFromQuery, token]);

  // 3. Load Recent Payments (using stable token)
  useEffect(() => {
    const loadRecent = async () => {
      if (!token) return;
      setIsLoadingRecentPayments(true);
      try {
        const resp = await fetchRecentPayments(token);
        const list = Array.isArray(resp) ? resp : resp.data || [];
        setRecentPayments(list);
      } catch (err) {
        console.error("Failed to load recent payments:", err);
      } finally {
        setIsLoadingRecentPayments(false);
      }
    };
    loadRecent();
  }, [token]);

  const bookingPricing = useMemo(() => {
    if (!booking) return null;
    const subtotal = Number(booking.subtotal ?? booking.totalAmount ?? 0) || 0;
    const serviceFee = Number(booking.serviceFee ?? Math.round(subtotal * 0.1)) || 0;
    const total = Number(booking.totalAmount ?? subtotal + serviceFee) || subtotal + serviceFee;
    return { subtotal, serviceFee, total };
  }, [booking]);

  const handleCheckout = async () => {
    setErrorMessage("");
    setCheckoutState("processing");

    try {
      const userId = user?.id || user?.userId || user?._id;
      if (!userId || !token) throw new Error("Authentication required.");

      let items = [];
      let allBookingIds = "";

      if (booking?.id) {
        allBookingIds = booking.id;
        items = [{
          menuItemName: booking.eventName || "Event Ticket",
          quantity: booking.numberOfTickets || 1,
          price: bookingPricing.subtotal / (booking.numberOfTickets || 1),
        }];
      } else {
        const bookingsData = await fetchPendingBookings(userId, token);
        const tickets = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];
        if (!tickets.length) throw new Error("No pending bookings found.");
        allBookingIds = tickets.map((t) => t.id).join(",");
        items = tickets.map((ticket) => ({
          menuItemName: ticket.eventName || "Event Ticket",
          quantity: ticket.numberOfTickets || 1,
          price: ticket.totalAmount / (ticket.numberOfTickets || 1),
        }));
      }

      const session = await createStripeCheckoutSession(items, token, allBookingIds);
      if (session?.url) window.location.href = session.url;
    } catch (error) {
      setCheckoutState("error");
      setErrorMessage(error.message);
    }
  };

  const resetCheckout = () => {
    setCheckoutState("idle");
    setErrorMessage("");
    setPromoCode("");
  };

  return (
    <AuthGuard>
      <AppShell
        title="Payments"
        description="Handle checkout and view transaction activity."
      >
        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          {/* Checkout Column */}
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Checkout Preview
            </p>
            <h3 className="mb-3 text-[1.05rem]">Confirm your selection</h3>
            
            {booking && (
              <div className="mb-3 rounded-[12px] border border-[rgba(54,45,32,0.06)] bg-[rgba(255,255,255,0.6)] p-3">
                <strong className="block">{booking.eventName}</strong>
                <div className="text-sm text-[var(--text-muted)]">
                  {booking.venue} • {new Date(booking.eventDate).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {isLoadingBooking ? (
                <div className="h-32 rounded-[12px] bg-gray-100 animate-pulse" />
              ) : bookingPricing ? (
                <>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4 flex justify-between">
                    <span>Subtotal</span>
                    <strong>LKR {bookingPricing.subtotal.toLocaleString()}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4 flex justify-between">
                    <span>Service Fee</span>
                    <strong>LKR {bookingPricing.serviceFee.toLocaleString()}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4 flex justify-between">
                    <span>Total Due</span>
                    <strong>LKR {bookingPricing.total.toLocaleString()}</strong>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No active booking selected.</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="cursor-pointer rounded-full bg-[var(--accent)] px-[1.35rem] py-[0.95rem] text-white shadow-lg disabled:opacity-50"
                disabled={checkoutState === "processing" || !bookingIdFromQuery}
                onClick={handleCheckout}
              >
                {checkoutState === "processing" ? "Processing..." : "Pay Now"}
              </button>
              {/* <button
                className="cursor-pointer rounded-full border border-[var(--border)] px-[1.35rem] py-[0.95rem] disabled:opacity-50"
                onClick={resetCheckout}
                disabled={checkoutState === "processing"}
              >
                Reset
              </button> */}
            </div>
          </article>

          {/* Transactions Column */}
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Transactions
            </p>
            <h3 className="mb-3 text-[1.05rem]">Recent activity</h3>
            <div className="grid gap-4">
              {isLoadingRecentPayments ? (
                <div className="h-20 rounded-[12px] bg-gray-100 animate-pulse" />
              ) : recentPayments.length > 0 ? (
                recentPayments.map((p) => (
                  <article key={p._id} className="flex items-start gap-4 rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-white/60 p-4">
                    <div className="flex-1">
                      <h4 className="text-[1rem] font-semibold">{p.eventName || "Booking Payment"}</h4>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <strong className="block text-sm">{p.currency} {p.amount.toLocaleString()}</strong>
                      <span className="text-[0.7rem] uppercase font-bold text-green-600">{p.status}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No transactions found.</p>
              )}
            </div>
          </article>
        </section>
      </AppShell>
    </AuthGuard>
  );
}