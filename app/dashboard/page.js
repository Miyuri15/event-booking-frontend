"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { getAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const featuredEvents = [
  {
    title: "Design Futures Summit",
    category: "Conference",
    location: "Colombo Innovation Hall",
    date: "April 12",
  },
  {
    title: "Neon Harbor Music Night",
    category: "Concert",
    location: "Port City Arena",
    date: "April 19",
  },
  {
    title: "Founders Breakfast Circle",
    category: "Networking",
    location: "Cinnamon Grand",
    date: "April 24",
  },
];

export default function DashboardPage() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  return (
    <AuthGuard>
      <AppShell
        title="Dashboard"
        description="A personalized starting point for discovering standout events, checking upcoming plans, and getting back into your booking activity quickly."
      >
        <section className="workspace-grid">
          <article className="panel hero-panel">
            <p className="eyebrow">Welcome Back</p>
            <h3>{auth?.user?.name ? `${auth.user.name}, your weekend looks open.` : "Your next event is waiting."}</h3>
            <p className="section-copy">
              Browse curated experiences, revisit your ticket activity, and keep
              your account details ready for faster checkout.
            </p>

            <div className="metric-row">
              <div className="metric-card">
                <strong>08</strong>
                <span>Recommended events</span>
              </div>
              <div className="metric-card">
                <strong>03</strong>
                <span>Upcoming experiences</span>
              </div>
              <div className="metric-card">
                <strong>12</strong>
                <span>Saved venues</span>
              </div>
            </div>
          </article>

          <article className="panel itinerary-panel">
            <p className="eyebrow">Quick Snapshot</p>
            <h3>Your event rhythm this month</h3>
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="timeline-dot" />
                <div>
                  <strong>Friday</strong>
                  <p>Live rooftop session at 8:00 PM</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot" />
                <div>
                  <strong>Sunday</strong>
                  <p>Creative workshop reservation opens at noon</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot" />
                <div>
                  <strong>Next Week</strong>
                  <p>Two new tech meetups match your preferences</p>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="panel">
          <p className="eyebrow">Featured Picks</p>
          <h3>Popular events worth checking today</h3>
          <div className="event-grid">
            {featuredEvents.map((event) => (
              <article className="event-card" key={event.title}>
                <span className="event-category">{event.category}</span>
                <h4>{event.title}</h4>
                <p>{event.location}</p>
                <div className="event-footer">
                  <span>{event.date}</span>
                  <button className="secondary-button" type="button">
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
