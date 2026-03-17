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
        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Upcoming
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Events you are set to attend
            </h3>
            <div className="grid gap-4">
              {upcomingTickets.map((ticket) => (
                <article
                  className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4"
                  key={ticket.title}
                >
                  <div>
                    <h4 className="mb-2 text-[1.15rem]">{ticket.title}</h4>
                    <p className="mb-0 text-[var(--text-muted)]">
                      {ticket.venue}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-4">
                    <span>{ticket.when}</span>
                    <strong>{ticket.seat}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Past Events
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Moments you already checked in to
            </h3>
            <div className="grid gap-4">
              {pastTickets.map((ticket) => (
                <article
                  className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4 opacity-[0.88]"
                  key={ticket.title}
                >
                  <div>
                    <h4 className="mb-2 text-[1.15rem]">{ticket.title}</h4>
                    <p className="mb-0 text-[var(--text-muted)]">
                      {ticket.venue}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-4">
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
