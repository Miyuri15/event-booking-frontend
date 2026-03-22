"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  createStripeCheckoutSession,
  fetchPendingBookings,
  fetchBookingById,
  fetchRecentPayments,
} from "@/lib/api";
import { getAuth } from "@/lib/auth";

// kept minimal: selectedMethod string shows in success message


export default function PaymentsPage() {
  // Read stored auth from localStorage (AuthGuard ensures user is authenticated)
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const user = auth?.user || null;
  const token = auth?.token || null;
  const [selectedMethod, setSelectedMethod] = useState("Primary Card");
  const [promoCode, setPromoCode] = useState("");
  const [checkoutState, setCheckoutState] = useState("idle");
  // legacy placeholder removed; recentPayments will be used instead
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const bookingIdFromQuery = searchParams?.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoadingRecentPayments, setIsLoadingRecentPayments] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingIdFromQuery || !token) return;
      setIsLoadingBooking(true);
      try {
        const data = await fetchBookingById(bookingIdFromQuery, token);

        // Normalize booking shape from API
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
        console.error("Failed to load booking:", err.message || err);
        setBooking(null);
        setErrorMessage(err.message || "Failed to load booking");
      } finally {
        setIsLoadingBooking(false);
      }
    };

    loadBooking();
  }, [bookingIdFromQuery, token]);

  // Fix for Recent Payments loop
  useEffect(() => {
    const loadRecent = async () => {
      if (!token) return; // Use token variable
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

  const pricing = useMemo(() => {
    const subtotal = 13500;
    const serviceFee = 1500;
    const discount = promoCode.trim().toUpperCase() === "LUMA10" ? 1500 : 0;
    return {
      subtotal,
      serviceFee,
      discount,
      total: subtotal + serviceFee - discount,
    };
  }, [promoCode]);

  // Compute displayed values safely from fetched booking (if present)
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
      const token = auth?.token || null;
      if (!userId || !token) throw new Error("Auth failed.");

      // If a booking was passed in query, pay for that single booking only
      let items = [];
      let allBookingIds = "";

      if (booking && booking.id) {
        allBookingIds = booking.id;
        items = [
          {
            menuItemName: booking.eventName || "Event Ticket",
            quantity: booking.numberOfTickets || 1,
            price: (() => {
              const qty = Number(booking.numberOfTickets || 1) || 1;
              if (booking.totalAmount && qty) return Number(booking.totalAmount) / qty;
              if (booking.ticketPrice) return Number(booking.ticketPrice);
              if (bookingPricing) return bookingPricing.subtotal / qty;
              return pricing.subtotal;
            })(),
          },
        ];
      } else {
        const bookingsData = await fetchPendingBookings(userId, token);
        const tickets = Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData.data || [];

        if (!tickets.length) throw new Error("Nothing to pay for.");

        // 1. Collect ALL IDs into a single comma-separated string
        allBookingIds = tickets.map((t) => t.id).join(",");

        // 2. Prepare all items for the Stripe Checkout screen
        items = tickets.map((ticket) => ({
          menuItemName: ticket.eventName || "Event Ticket",
          quantity: ticket.numberOfTickets || 1,
          price: ticket.totalAmount / (ticket.numberOfTickets || 1),
        }));
      }

      // 3. Pass the string of IDs to your service
      const session = await createStripeCheckoutSession(items, token, allBookingIds);

      if (session?.url) {
        window.location.href = session.url;
        return;
      }
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
        description="Handle checkout, saved payment methods, and transaction visibility in a dedicated payment portal."
      >
        {/* Display error message if any */}
        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Checkout Preview
            </p>
            <h3 className="mb-3 text-[1.05rem]">Fast payment experience</h3>
            {booking ? (
              <div className="mb-3 rounded-[12px] border border-[rgba(54,45,32,0.06)] bg-[rgba(255,255,255,0.6)] p-3">
                <strong className="block">{booking.eventName || booking.title || booking.name}</strong>
                <div className="text-sm text-[var(--text-muted)]">
                  {booking.venue && <span>{booking.venue}</span>}
                  {booking.eventDate && <span> • {new Date(booking.eventDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ) : null}
            <div className="grid gap-4">
              {isLoadingBooking ? (
                <div className="rounded-[12px] p-6 border border-[rgba(54,45,32,0.06)] bg-[rgba(255,255,255,0.6)] animate-pulse" />
              ) : bookingPricing ? (
                <>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Subtotal</span>
                    <strong>LKR {bookingPricing.subtotal.toLocaleString()}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Service Fee</span>
                    <strong>LKR {bookingPricing.serviceFee.toLocaleString()}</strong>
                  </div>
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                    <span>Total Due</span>
                    <strong>LKR {bookingPricing.total.toLocaleString()}</strong>
                  </div>
                </>
              ) : (
                <div className="rounded-[12px] border border-[rgba(54,45,32,0.06)] bg-[rgba(255,255,255,0.6)] p-4">
                  <strong>No event selected for payment</strong>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    You navigated to Payments from the sidebar. To pay for a specific booking,
                    open the Bookings page and click "Proceed to Payment" on the booking you want to pay for.
                    Alternatively, click "Pay Now" to checkout all pending bookings.
                  </p>
                </div>
              )}
            </div>
            {/* <label className="mt-4 grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Promo Code</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Try LUMA10"
                type="text"
                value={promoCode}
                disabled={checkoutState === "processing"}
              />
            </label> */}
            {checkoutState === "success" ? (
              <p className="mt-4 rounded-2xl border border-[rgba(47,125,83,0.18)] bg-[rgba(47,125,83,0.08)] px-4 py-[0.9rem] text-[var(--success)]">
                Payment completed successfully using {selectedMethod}.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={checkoutState === "processing"}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutState === "processing" ? "Processing..." : "Pay Now"}
              </button>
              <button
                className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={resetCheckout}
                type="button"
                disabled={checkoutState === "processing"}
              >
                Reset Checkout
              </button>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Transactions
            </p>
            <h3 className="mb-3 text-[1.05rem]">Recent payment activity</h3>
            <div className="grid gap-4">
              {isLoadingRecentPayments ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-[12px] border border-[rgba(54,45,32,0.06)] bg-[rgba(255,255,255,0.6)] p-4 animate-pulse"
                    />
                  ))
              ) : recentPayments && recentPayments.length > 0 ? (
                recentPayments.map((p) => (
                  <article
                    key={p._id || p.id}
                    className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                  >
                    <div>
                      <h4 className="mb-2 text-[1.15rem]">{p.eventName || p.title || `Payment ${p._id?.slice(-6)}`}</h4>
                      <p className="mb-0 text-[var(--text-muted)]">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <strong>{(p.currency || "LKR") + " " + (Number(p.amount) || 0).toLocaleString()}</strong>
                      <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                        {p.status || "UNKNOWN"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-[var(--text-muted)] py-4">No recent payments found.</p>
              )}
            </div>
          </article>
        </section>

        {/* Transactions moved into the right column; previous hardcoded Transactions section removed. */}
      </AppShell>
    </AuthGuard>
  );
}