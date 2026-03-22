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
  const auth = useMemo(() => (typeof window !== "undefined" ? getAuth() : null), []);
  const user = auth?.user || null;
  const token = auth?.token || null;

  const searchParams = useSearchParams();
  const bookingIdFromQuery = searchParams?.get("bookingId");

  const [checkoutState, setCheckoutState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [booking, setBooking] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoadingRecentPayments, setIsLoadingRecentPayments] = useState(false);

  // 1. Load Specific Booking (Matching your provided JSON structure)
  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingIdFromQuery || !token) return;
      setIsLoadingBooking(true);
      try {
        const data = await fetchBookingById(bookingIdFromQuery, token);
        
        // Map directly from your response object
        setBooking({
          id: data.id,
          eventName: data.eventName,
          eventDate: data.eventDate,
          venue: data.venue,
          numberOfTickets: data.numberOfTickets,
          totalAmount: data.totalAmount, // Already includes all fees
          paymentStatus: data.paymentStatus
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

  // 2. Load Recent Payments
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
          menuItemName: booking.eventName,
          quantity: booking.numberOfTickets,
          // Since totalAmount is inclusive, we divide by quantity for Stripe line items
          price: booking.totalAmount / booking.numberOfTickets,
        }];
      } else {
        // Fallback for checkout-all logic
        const bookingsData = await fetchPendingBookings(userId, token);
        const tickets = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];
        if (!tickets.length) throw new Error("No pending bookings found.");
        
        allBookingIds = tickets.map((t) => t.id).join(",");
        items = tickets.map((ticket) => ({
          menuItemName: ticket.eventName,
          quantity: ticket.numberOfTickets,
          price: ticket.totalAmount / ticket.numberOfTickets,
        }));
      }

      const session = await createStripeCheckoutSession(items, token, allBookingIds);
      if (session?.url) window.location.href = session.url;
    } catch (error) {
      setCheckoutState("error");
      setErrorMessage(error.message);
    }
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
            <h3 className="mb-6 text-[1.05rem]">Confirm your selection</h3>
            
            <div className="grid gap-4">
              {isLoadingBooking ? (
                <div className="h-48 rounded-[20px] bg-gray-100 animate-pulse" />
              ) : booking ? (
                <>
                  {/* Event Details Card */}
                  <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-white/60 p-5 shadow-sm">
                    <h4 className="text-lg font-bold text-[var(--text-main)] mb-1">{booking.eventName}</h4>
                    <div className="space-y-1 text-sm text-[var(--text-muted)]">
                      <p>📍 {booking.venue}</p>
                      <p>📅 {new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                      <p>🎟️ {booking.numberOfTickets} Ticket(s)</p>
                    </div>
                  </div>

                  {/* Summary Rows */}
                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between px-2">
                      <span className="text-[var(--text-muted)]">Unit Price (Average)</span>
                      <span className="font-medium">LKR {(booking.totalAmount / booking.numberOfTickets).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span className="text-[var(--text-muted)]">Quantity</span>
                      <span className="font-medium">x {booking.numberOfTickets}</span>
                    </div>
                    <div className="pt-3 border-t border-[rgba(54,45,32,0.1)] flex justify-between items-center px-2">
                      <span className="text-lg font-bold">Total Due</span>
                      <strong className="text-xl text-[var(--accent)]">
                        LKR {booking.totalAmount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-[20px]">
                   <p className="text-[var(--text-muted)]">Please select a booking from your dashboard to proceed with payment.</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                className="w-full cursor-pointer rounded-full bg-[var(--accent)] px-8 py-4 text-white font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={checkoutState === "processing" || !booking}
                onClick={handleCheckout}
              >
                {checkoutState === "processing" ? "Redirecting to Stripe..." : `Pay LKR ${booking?.totalAmount.toLocaleString() || '0'} Now`}
              </button>
            </div>
          </article>

          {/* Transactions Column (Unchanged) */}
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Transactions
            </p>
            <h3 className="mb-6 text-[1.05rem]">Recent activity</h3>
            <div className="grid gap-4">
              {isLoadingRecentPayments ? (
                <div className="h-20 rounded-[12px] bg-gray-100 animate-pulse" />
              ) : recentPayments.length > 0 ? (
                recentPayments.map((p) => (
                  <article key={p._id || p.id} className="flex items-start gap-4 rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-white/60 p-4">
                    <div className="flex-1">
                      <h4 className="text-[1rem] font-semibold">{p.eventName || "Booking Payment"}</h4>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <strong className="block text-sm">{p.currency || 'LKR'} {p.amount.toLocaleString()}</strong>
                      <span className={`text-[0.7rem] uppercase font-bold ${p.status === 'SUCCESS' ? 'text-green-600' : 'text-orange-500'}`}>
                        {p.status}
                      </span>
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