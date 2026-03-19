// BookingReview.js
"use client";

const BookingReview = ({ selectedEvent, ticketCount, total }) => {
  return (
    <div className="grid gap-4">
      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span>Event</span>
        <strong>{selectedEvent.title}</strong>
      </div>
      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span>Venue</span>
        <strong>{selectedEvent.venue}</strong>
      </div>
      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span>Seats</span>
        <strong>{ticketCount}</strong>
      </div>
      <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
        <span>Total Due</span>
        <strong>LKR {total.toLocaleString()}</strong>
      </div>
    </div>
  );
};

export default BookingReview;
