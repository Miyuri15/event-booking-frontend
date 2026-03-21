"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchMyBookings } from "@/lib/api";
import { getAuth } from "@/lib/auth";

const paymentMethods = [
  { label: "Visa ending in 2481", type: "Primary Card" },
  { label: "Mastercard ending in 9044", type: "Backup Card" },
  { label: "Luma Wallet Balance", type: "LKR 6,500 available" },
];

const transactions = [
  {
    title: "Neon Harbor Music Night",
    amount: "LKR 15,000",
    status: "Paid",
    date: "April 14",
  },
  {
    title: "Future of Product Asia",
    amount: "LKR 12,000",
    status: "Pending",
    date: "April 16",
  },
];

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
    "Selected reservation"
  );
};

const getBookingDate = (booking) => {
  const eventDetails = getBookingEvent(booking);
  return booking?.eventDate || booking?.date || eventDetails?.date || null;
};

const getBookingTicketPrice = (booking) => {
  const eventDetails = getBookingEvent(booking);
  return Number(
    booking?.ticketPrice || eventDetails?.ticketPrice || booking?.price || 0,
  );
};

const getBookingTicketCount = (booking) => {
  return Number(booking?.numberOfTickets || booking?.ticketCount || 0);
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const [auth, setAuth] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].label);
  const [promoCode, setPromoCode] = useState("");
  const [checkoutState, setCheckoutState] = useState("idle");
  const [paymentHistory, setPaymentHistory] = useState(transactions);
  const [myBookings, setMyBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

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
        setMyBookings(Array.isArray(data) ? data : []);
        setBookingsError("");
      } catch (error) {
        setBookingsError(error.message || "Failed to load bookings.");
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();
  }, [auth]);

  const pendingBookings = useMemo(() => {
    return myBookings.filter(
      (booking) => (booking?.status || "").toLowerCase() === "pending",
    );
  }, [myBookings]);

  const selectedBooking = useMemo(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      return (
        pendingBookings.find(
          (booking) => String(booking?._id || booking?.id) === bookingId,
        ) || null
      );
    }

    return pendingBookings[0] || null;
  }, [pendingBookings, searchParams]);

  const pricing = useMemo(() => {
    const ticketPrice = getBookingTicketPrice(selectedBooking);
    const ticketCount = getBookingTicketCount(selectedBooking);
    const subtotal = ticketPrice * ticketCount;
    const serviceFee = Math.round(subtotal * 0.1);
    const discount = promoCode.trim().toUpperCase() === "LUMA10" ? 1500 : 0;
    return {
      subtotal,
      serviceFee,
      discount,
      total: subtotal + serviceFee - discount,
    };
  }, [promoCode, selectedBooking]);

  const handleCheckout = () => {
    if (!selectedBooking) return;

    setCheckoutState("processing");

    setTimeout(() => {
      setPaymentHistory((current) => [
        {
          title: getBookingTitle(selectedBooking),
          amount: `LKR ${pricing.total.toLocaleString()}`,
          status: "Paid",
          date: "Today",
        },
        ...current,
      ]);
      setCheckoutState("success");
    }, 1200);
  };

  return (
    <AuthGuard>
      <AppShell
        title="Payments"
        description="Handle checkout, saved payment methods, and transaction visibility in a dedicated payment portal."
      >
        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Checkout Preview
            </p>
            <h3 className="mb-3 text-[1.05rem]">Fast payment experience</h3>
            {selectedBooking ? (
              <div className="mb-4 rounded-[20px] border border-[rgba(192,90,43,0.18)] bg-[rgba(255,255,255,0.7)] p-4">
                <span className="block text-[0.9rem] text-[var(--text-muted)]">
                  Paying for
                </span>
                <strong className="block text-[1.1rem]">
                  {getBookingTitle(selectedBooking)}
                </strong>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {getBookingDate(selectedBooking)
                    ? new Date(getBookingDate(selectedBooking)).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Date TBD"}{" "}
                  • {getBookingTicketCount(selectedBooking)} ticket(s)
                </p>
              </div>
            ) : null}
            <div className="grid gap-4">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Subtotal</span>
                <strong>LKR {pricing.subtotal.toLocaleString()}</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Service Fee</span>
                <strong>LKR {pricing.serviceFee.toLocaleString()}</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Promo Discount</span>
                <strong>- LKR {pricing.discount.toLocaleString()}</strong>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <span>Total Due</span>
                <strong>LKR {pricing.total.toLocaleString()}</strong>
              </div>
            </div>
            <label className="mt-4 grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Promo Code</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Try LUMA10"
                type="text"
                value={promoCode}
              />
            </label>
            {checkoutState === "success" ? (
              <p className="mt-4 rounded-2xl border border-[rgba(47,125,83,0.18)] bg-[rgba(47,125,83,0.08)] px-4 py-[0.9rem] text-[var(--success)]">
                Payment completed successfully using {selectedMethod}.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                disabled={checkoutState === "processing" || !selectedBooking}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutState === "processing" ? "Processing..." : "Pay Now"}
              </button>
              <button
                className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                onClick={() => setCheckoutState("idle")}
                type="button"
              >
                Reset Checkout
              </button>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Pending Reservations
            </p>
            <h3 className="mb-3 text-[1.05rem]">Choose a booking to pay</h3>
            <div className="grid gap-4">
              {isLoadingBookings ? (
                <p className="text-[var(--text-muted)]">Loading bookings...</p>
              ) : bookingsError ? (
                <p className="text-red-600">{bookingsError}</p>
              ) : pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => {
                  const bookingId = String(booking?._id || booking?.id);
                  const isActive =
                    bookingId === String(selectedBooking?._id || selectedBooking?.id);

                  return (
                    <Link
                      className={
                        isActive
                          ? "w-full cursor-pointer rounded-[20px] border border-[rgba(192,90,43,0.35)] bg-[rgba(255,255,255,0.6)] p-4 text-left shadow-[0_0_0_4px_rgba(192,90,43,0.08)]"
                          : "w-full cursor-pointer rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4 text-left"
                      }
                      href={`/payments?bookingId=${bookingId}`}
                      key={bookingId}
                    >
                      <span className="block text-[0.9rem] text-[var(--text-muted)]">
                        Pending booking
                      </span>
                      <strong className="block">{getBookingTitle(booking)}</strong>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {getBookingTicketCount(booking)} ticket(s)
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                  <p className="text-[var(--text-muted)]">
                    You do not have any pending reservations to pay right now.
                  </p>
                  <Link
                    className="mt-3 inline-flex rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.1rem] py-[0.7rem] text-sm font-semibold text-[var(--secondary)]"
                    href="/bookings"
                  >
                    Back to Bookings
                  </Link>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Saved Methods
            </p>
            <h3 className="mb-3 text-[1.05rem]">Wallet and cards</h3>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <button
                  className={
                    method.label === selectedMethod
                      ? "w-full cursor-pointer rounded-[20px] border border-[rgba(192,90,43,0.35)] bg-[rgba(255,255,255,0.6)] p-4 text-left shadow-[0_0_0_4px_rgba(192,90,43,0.08)]"
                      : "w-full cursor-pointer rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4 text-left"
                  }
                  key={method.label}
                  onClick={() => setSelectedMethod(method.label)}
                  type="button"
                >
                  <span>{method.type}</span>
                  <strong>{method.label}</strong>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Transactions
          </p>
          <h3 className="mb-3 text-[1.05rem]">Recent payment activity</h3>
          <div className="grid gap-4">
            {paymentHistory.map((transaction) => (
              <article
                className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                key={transaction.title}
              >
                <div>
                  <h4 className="mb-2 text-[1.15rem]">{transaction.title}</h4>
                  <p className="mb-0 text-[var(--text-muted)]">
                    {transaction.date}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <strong>{transaction.amount}</strong>
                  <span className="inline-flex items-center rounded-full bg-[rgba(33,83,79,0.12)] px-[0.8rem] py-[0.45rem] text-[0.82rem] font-bold text-[var(--secondary)]">
                    {transaction.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
