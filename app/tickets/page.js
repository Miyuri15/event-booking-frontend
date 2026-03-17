"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

const upcomingTickets = [
  {
    title: "Neon Harbor Music Night",
    venue: "Port City Arena",
    when: "April 19, 8:00 PM",
    seat: "Floor A12",
  },
  {
    title: "Founders Breakfast Circle",
    venue: "Cinnamon Grand",
    when: "April 24, 7:30 AM",
    seat: "Table 04",
  },
];

const pastTickets = [
  {
    title: "Motion Design Meetup",
    venue: "Trace Expert City",
    when: "March 02, 6:30 PM",
  },
  {
    title: "Jazz Under Lanterns",
    venue: "Independence Arcade",
    when: "February 17, 8:15 PM",
  },
];

export default function TicketsPage() {
  return (
    <AuthGuard>
      <AppShell
        title="My Tickets"
        description="A clean ticket hub for upcoming reservations, past experiences, and quick re-entry into your event history."
      >
        <section className="workspace-grid">
          <article className="panel">
            <p className="eyebrow">Upcoming</p>
            <h3>Events you are set to attend</h3>
            <div className="ticket-list">
              {upcomingTickets.map((ticket) => (
                <article className="ticket-card" key={ticket.title}>
                  <div>
                    <h4>{ticket.title}</h4>
                    <p>{ticket.venue}</p>
                  </div>
                  <div className="ticket-meta">
                    <span>{ticket.when}</span>
                    <strong>{ticket.seat}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Past Events</p>
            <h3>Moments you already checked in to</h3>
            <div className="ticket-list">
              {pastTickets.map((ticket) => (
                <article className="ticket-card subtle-ticket-card" key={ticket.title}>
                  <div>
                    <h4>{ticket.title}</h4>
                    <p>{ticket.venue}</p>
                  </div>
                  <div className="ticket-meta">
                    <span>{ticket.when}</span>
                    <strong>Completed</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
