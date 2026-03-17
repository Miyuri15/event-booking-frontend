"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

const categories = [
  "Concerts",
  "Conferences",
  "Workshops",
  "Nightlife",
  "Sports",
];

const events = [
  {
    title: "Pulse Arena Live",
    tag: "Concert",
    blurb:
      "A stadium-scale electronic show with immersive visuals and premium floor access.",
    location: "Colombo Arena",
    price: "LKR 7,500",
  },
  {
    title: "Future of Product Asia",
    tag: "Conference",
    blurb:
      "A one-day summit for founders, designers, and builders shaping digital products.",
    location: "Hilton Colombo",
    price: "LKR 12,000",
  },
  {
    title: "Ceramics + Coffee Session",
    tag: "Workshop",
    blurb:
      "A relaxed weekend studio experience for beginners who want something tactile and social.",
    location: "Barefoot Studio",
    price: "LKR 4,200",
  },
  {
    title: "Midnight Food Street Pass",
    tag: "City Experience",
    blurb:
      "Access a curated late-night food crawl with chef pop-ups and live acoustic sets.",
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
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Discover
          </p>
          <h3 className="mb-3 text-[1.05rem]">What are you in the mood for?</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                className="cursor-pointer rounded-full border border-[rgba(54,45,32,0.12)] bg-[rgba(255,255,255,0.7)] px-4 py-[0.8rem]"
                key={category}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
          {events.map((event) => (
            <article
              className="flex min-h-[260px] flex-col rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.78)] p-[1.2rem] shadow-[0_16px_35px_rgba(50,38,22,0.06)]"
              key={event.title}
            >
              <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
                {event.tag}
              </span>
              <h4 className="mb-2 text-[1.15rem]">{event.title}</h4>
              <p className="leading-[1.7] text-[var(--text-muted)]">
                {event.blurb}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4 text-[var(--text-muted)]">
                <span>{event.location}</span>
                <strong>{event.price}</strong>
              </div>
              <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                <button
                  className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  type="button"
                >
                  Reserve Seat
                </button>
                <button
                  className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  type="button"
                >
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
