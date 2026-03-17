"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useMemo, useState } from "react";

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

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].label);
  const [promoCode, setPromoCode] = useState("");
  const [checkoutState, setCheckoutState] = useState("idle");
  const [paymentHistory, setPaymentHistory] = useState(transactions);

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

  const handleCheckout = () => {
    setCheckoutState("processing");

    setTimeout(() => {
      setPaymentHistory((current) => [
        {
          title: "Design Futures Summit",
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
        <section className="workspace-grid">
          <article className="panel">
            <p className="eyebrow">Checkout Preview</p>
            <h3>Fast payment experience</h3>
            <div className="summary-stack">
              <div className="summary-card">
                <span>Subtotal</span>
                <strong>LKR {pricing.subtotal.toLocaleString()}</strong>
              </div>
              <div className="summary-card">
                <span>Service Fee</span>
                <strong>LKR {pricing.serviceFee.toLocaleString()}</strong>
              </div>
              <div className="summary-card">
                <span>Promo Discount</span>
                <strong>- LKR {pricing.discount.toLocaleString()}</strong>
              </div>
              <div className="summary-card">
                <span>Total Due</span>
                <strong>LKR {pricing.total.toLocaleString()}</strong>
              </div>
            </div>
            <label>
              Promo Code
              <input
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Try LUMA10"
                type="text"
                value={promoCode}
              />
            </label>
            {checkoutState === "success" ? (
              <p className="status success">
                Payment completed successfully using {selectedMethod}.
              </p>
            ) : null}
            <div className="hero-actions">
              <button
                className="primary-button"
                disabled={checkoutState === "processing"}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutState === "processing" ? "Processing..." : "Pay Now"}
              </button>
              <button
                className="secondary-button"
                onClick={() => setCheckoutState("idle")}
                type="button"
              >
                Reset Checkout
              </button>
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Saved Methods</p>
            <h3>Wallet and cards</h3>
            <div className="summary-stack">
              {paymentMethods.map((method) => (
                <button
                  className={
                    method.label === selectedMethod
                      ? "summary-card summary-card-button active-selection-card"
                      : "summary-card summary-card-button"
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

        <section className="panel">
          <p className="eyebrow">Transactions</p>
          <h3>Recent payment activity</h3>
          <div className="ticket-list">
            {paymentHistory.map((transaction) => (
              <article className="ticket-card" key={transaction.title}>
                <div>
                  <h4>{transaction.title}</h4>
                  <p>{transaction.date}</p>
                </div>
                <div className="ticket-meta">
                  <strong>{transaction.amount}</strong>
                  <span className="status-pill">{transaction.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
