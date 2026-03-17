"use client";

import AppShell from "@/components/AppShell";
import PublicAppShell from "@/components/PublicAppShell";
import LoginPromptModal from "@/components/LoginPromptModal";
import { getAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const categories = [
  "Concerts",
  "Conferences",
  "Workshops",
  "Nightlife",
  "Sports",
];

const events = [
  {
    id: 1,
    title: "Pulse Arena Live",
    tag: "Concert",
    blurb:
      "A stadium-scale electronic show with immersive visuals and premium floor access.",
    location: "Colombo Arena",
    price: "LKR 7,500",
  },
  {
    id: 2,
    title: "Future of Product Asia",
    tag: "Conference",
    blurb:
      "A one-day summit for founders, designers, and builders shaping digital products.",
    location: "Hilton Colombo",
    price: "LKR 12,000",
  },
  {
    id: 3,
    title: "Ceramics + Coffee Session",
    tag: "Workshop",
    blurb:
      "A relaxed weekend studio experience for beginners who want something tactile and social.",
    location: "Barefoot Studio",
    price: "LKR 4,200",
  },
  {
    id: 4,
    title: "Midnight Food Street Pass",
    tag: "City Experience",
    blurb:
      "Access a curated late-night food crawl with chef pop-ups and live acoustic sets.",
    location: "Colombo 07",
    price: "LKR 3,800",
  },
];

function EventCard({ event, onBookClick, isAuthenticated }) {
  return (
    <article className="flex min-h-[260px] flex-col rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.78)] p-[1.2rem] shadow-[0_16px_35px_rgba(50,38,22,0.06)]">
      <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
        {event.tag}
      </span>
      <h4 className="mb-2 text-[1.15rem]">{event.title}</h4>
      <p className="leading-[1.7] text-[var(--text-muted)]">{event.blurb}</p>
      <div className="mt-4 flex items-center justify-between gap-4 text-[var(--text-muted)]">
        <span>{event.location}</span>
        <strong>{event.price}</strong>
      </div>
      <div className="mt-auto flex items-center justify-between gap-4 pt-4">
        <button
          className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
          onClick={() => onBookClick(event)}
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
  );
}

export default function ExplorePage() {
  const [auth, setAuth] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);
    setIsReady(true);
  }, []);

  const handleBookClick = (event) => {
    if (!auth?.token) {
      setSelectedEvent(event);
      setShowLoginPrompt(true);
    } else {
      // For authenticated users, proceed with booking (could navigate to booking page)
      console.log("Booking event:", event);
    }
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    setSelectedEvent(null);
  };

  if (!isReady) {
    return (
      <main className="mx-auto grid min-h-screen w-[min(900px,calc(100%-2rem))] place-items-center">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Preparing
          </p>
          <h2 className="mb-4 text-[1.7rem]">
            Loading your event browsing experience...
          </h2>
        </section>
      </main>
    );
  }

  const Shell = auth?.token ? AppShell : PublicAppShell;

  return (
    <>
      <Shell
        title="Explore Events"
        description={
          auth?.token
            ? "A discovery-first browsing experience with categories, featured listings, and conversion-friendly event cards."
            : "Browse amazing events happening near you. Sign in to book your favorite events."
        }
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
            <EventCard
              key={event.id}
              event={event}
              onBookClick={handleBookClick}
              isAuthenticated={!!auth?.token}
            />
          ))}
        </section>
      </Shell>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        eventTitle={selectedEvent?.title}
        onCancel={handleCloseLoginPrompt}
      />
    </>
  );
}
