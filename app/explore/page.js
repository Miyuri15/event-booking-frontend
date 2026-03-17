"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

const categories = ["Concerts", "Conferences", "Workshops", "Nightlife", "Sports"];

const events = [
  {
    title: "Pulse Arena Live",
    tag: "Concert",
    blurb: "A stadium-scale electronic show with immersive visuals and premium floor access.",
    location: "Colombo Arena",
    price: "LKR 7,500",
  },
  {
    title: "Future of Product Asia",
    tag: "Conference",
    blurb: "A one-day summit for founders, designers, and builders shaping digital products.",
    location: "Hilton Colombo",
    price: "LKR 12,000",
  },
  {
    title: "Ceramics + Coffee Session",
    tag: "Workshop",
    blurb: "A relaxed weekend studio experience for beginners who want something tactile and social.",
    location: "Barefoot Studio",
    price: "LKR 4,200",
  },
  {
    title: "Midnight Food Street Pass",
    tag: "City Experience",
    blurb: "Access a curated late-night food crawl with chef pop-ups and live acoustic sets.",
    location: "Colombo 07",
    price: "LKR 3,800",
  },
];

export default function ExplorePage() {
  return (
    <AuthGuard>
      <AppShell
        title="Explore Events"
        description="A discovery-first browsing experience with categories, featured listings, and conversion-friendly event cards."
      >
        <section className="panel">
          <p className="eyebrow">Discover</p>
          <h3>What are you in the mood for?</h3>
          <div className="chip-row">
            {categories.map((category) => (
              <button className="category-chip" key={category} type="button">
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="event-grid">
          {events.map((event) => (
            <article className="event-card event-card-large" key={event.title}>
              <span className="event-category">{event.tag}</span>
              <h4>{event.title}</h4>
              <p className="section-copy">{event.blurb}</p>
              <div className="event-meta">
                <span>{event.location}</span>
                <strong>{event.price}</strong>
              </div>
              <div className="event-footer">
                <button className="primary-button" type="button">
                  Reserve Seat
                </button>
                <button className="secondary-button" type="button">
                  Save
                </button>
              </div>
            </article>
          ))}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
