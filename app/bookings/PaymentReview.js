// PaymentReview.js
"use client";

const PaymentReview = ({ selectedEvent, total }) => {
  return (
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
  );
};

export default PaymentReview;
