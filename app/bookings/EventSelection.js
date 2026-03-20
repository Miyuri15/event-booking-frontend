// EventSelection.js
"use client";

const EventSelection = ({
  bookableEvents,
  selectedEventId,
  setSelectedEventId,
}) => {
  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
      {bookableEvents.map((event) => (
        <button
          key={event._id}
          className={
            event._id === selectedEventId
              ? "w-full cursor-pointer rounded-[20px] border border-[rgba(192,90,43,0.35)] bg-[rgba(255,255,255,0.82)] p-4 text-left shadow-[0_0_0_4px_rgba(192,90,43,0.08)]"
              : "w-full cursor-pointer rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.82)] p-4 text-left"
          }
          onClick={() => setSelectedEventId(event._id)}
          type="button"
        >
          <h4 className="mb-2 text-[1.15rem]">{event.title}</h4>
          <p className="mb-0 text-[var(--text-muted)]">{event.venue}</p>
          <strong>{formatDate(event.date)}</strong>
        </button>
      ))}
    </div>
  );
};

export default EventSelection;
