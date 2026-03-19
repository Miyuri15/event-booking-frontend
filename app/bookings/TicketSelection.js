// TicketSelection.js
"use client";

const TicketSelection = ({
  step,
  ticketCount,
  setTicketCount,
  selectedEvent,
}) => {
  return (
    step === 2 && (
      <div className="grid gap-4">
        <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
          <span>Number of Tickets</span>
          <input
            className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
            max="6"
            min="1"
            onChange={(event) =>
              setTicketCount(Number(event.target.value) || 1)
            }
            type="number"
            value={ticketCount}
          />
        </label>

        <div className="grid gap-4">
          <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
            <span>Ticket Price</span>
            <strong>LKR {selectedEvent.ticketPrice}</strong>
          </div>
          <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
            <span>Seats</span>
            <strong>{ticketCount}</strong>
          </div>
        </div>
      </div>
    )
  );
};

export default TicketSelection;
