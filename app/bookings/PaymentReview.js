"use client";

const PaymentReview = ({
  selectedEvent,
  total,
  serviceFee,
  ticketCount,
  isProcessing,
  onConfirm,
}) => {
  if (!selectedEvent) {
    return (
      <div className="grid gap-4">
        <p className="text-[var(--text-muted)]">No event selected</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span className="block text-[0.9rem] text-[var(--text-muted)] mb-1">
          Event
        </span>
        <strong className="text-[1.1rem]">
          {selectedEvent.name || selectedEvent.title}
        </strong>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {selectedEvent.venue} •{" "}
          {selectedEvent.date
            ? new Date(selectedEvent.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date TBD"}
        </p>
      </div>

      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span className="block text-[0.9rem] text-[var(--text-muted)] mb-1">
          Number of Tickets
        </span>
        <strong className="text-[1.1rem]">{ticketCount}</strong>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          LKR {selectedEvent.ticketPrice?.toLocaleString()} per ticket
        </p>
      </div>

      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span className="block text-[0.9rem] text-[var(--text-muted)] mb-1">
          Total Amount
        </span>
        <strong className="text-[1.3rem] text-[var(--accent-dark)]">
          LKR {total.toLocaleString()}
        </strong>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Includes LKR {serviceFee.toLocaleString()} service fee
        </p>
      </div>

      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(33,83,79,0.05)] p-4">
        <span className="block text-[0.9rem] text-[var(--text-muted)] mb-1">
          Booking Status
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--success)]"></span>
          <strong className="text-[var(--success)]">Ready to confirm</strong>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Please review your booking details before confirming.
        </p>
      </div>

      <button
        className="mt-2 cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed w-full"
        onClick={onConfirm}
        disabled={isProcessing}
        type="button"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Confirming Booking...
          </span>
        ) : (
          "Confirm Booking"
        )}
      </button>
    </div>
  );
};

export default PaymentReview;
