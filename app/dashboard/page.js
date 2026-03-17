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
        <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <article className="min-h-[320px] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Welcome Back
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              {auth?.user?.name
                ? `${auth.user.name}, your weekend looks open.`
                : "Your next event is waiting."}
            </h3>
            <p className="leading-[1.7] text-[var(--text-muted)]">
              Browse curated experiences, revisit your ticket activity, and keep
              your account details ready for faster checkout.
            </p>

            <div className="mt-[1.2rem] grid grid-cols-3 gap-[0.85rem] max-[900px]:grid-cols-1">
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">08</strong>
                <span className="text-[var(--text-muted)]">
                  Recommended events
                </span>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">03</strong>
                <span className="text-[var(--text-muted)]">
                  Upcoming experiences
                </span>
              </div>
              <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                <strong className="mb-1 block text-2xl">12</strong>
                <span className="text-[var(--text-muted)]">Saved venues</span>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Coming Up
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Your event rhythm this month
            </h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4">
                <span className="mt-[0.45rem] h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
                <div>
                  <strong>Friday</strong>
                  <p className="mb-0 text-[var(--text-muted)]">
                    Live rooftop session at 8:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4">
                <span className="mt-[0.45rem] h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
                <div>
                  <strong>Sunday</strong>
                  <p className="mb-0 text-[var(--text-muted)]">
                    Creative workshop reservation opens at noon
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[0.9rem] rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.65)] p-4">
                <span className="mt-[0.45rem] h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" />
                <div>
                  <strong>Next Week</strong>
                  <p className="mb-0 text-[var(--text-muted)]">
                    Two new tech meetups match your preferences
                  </p>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Featured Picks
          </p>
          <h3 className="mb-3 text-[1.05rem]">
            Popular events worth checking today
          </h3>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            {featuredEvents.map((event) => (
              <article
                className="rounded-[24px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.78)] p-[1.2rem] shadow-[0_16px_35px_rgba(50,38,22,0.06)]"
                key={event.title}
              >
                <span className="mb-[0.9rem] inline-flex w-fit rounded-full bg-[rgba(192,90,43,0.11)] px-3 py-[0.4rem] text-[0.82rem] font-bold text-[var(--accent-dark)]">
                  {event.category}
                </span>
                <h4 className="mb-2 text-[1.15rem]">{event.title}</h4>
                <p className="mb-0 text-[var(--text-muted)]">
                  {event.location}
                </p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <span>{event.date}</span>
                  <button
                    className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                    type="button"
                  >
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
