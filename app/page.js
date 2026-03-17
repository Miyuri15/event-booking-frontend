import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-[min(1200px,calc(100%-2rem))] pt-8 pb-12">
      <section className="grid min-h-[calc(100vh-5rem)] grid-cols-[1.1fr_0.9fr] items-center gap-6 max-[900px]:grid-cols-1">
        <div>
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Live Experiences, Reimagined
          </p>
          <h1 className="mb-4 max-w-[720px] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95]">
            Find the next event worth leaving home for.
          </h1>
          <p className="max-w-[640px] leading-[1.7] text-[var(--text-muted)]">
            Browse standout concerts, startup meetups, creative workshops, and
            premium city events through a modern booking platform designed for
            fast discovery and smooth sign-in.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              href="/auth"
            >
              Get Started
            </Link>
            <Link
              className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              href="/dashboard"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>

        <div className="flex justify-end max-[900px]:justify-stretch">
          <article className="w-[min(100%,440px)] rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(243,209,180,0.25),transparent_22%),linear-gradient(160deg,rgba(18,41,39,0.95),rgba(21,62,58,0.94))] p-8 text-[#fff8ef] shadow-[var(--shadow)] max-[900px]:w-full">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#fff8ef]">
              Featured Tonight
            </p>
            <h2 className="mb-4 text-[1.7rem] text-[#fff8ef]">
              Colombo After Dark Sessions
            </h2>
            <p className="leading-[1.7] text-[#fff8ef]">
              Rooftop music, curated dining, and a late-night visual experience
              made for memorable city weekends.
            </p>
            <div className="mt-[1.2rem] grid grid-cols-3 gap-[0.85rem] max-[900px]:grid-cols-1">
              <div>
                <strong className="mb-1 block text-2xl">1.2K+</strong>
                <span className="text-[var(--text-muted)]">Interested</span>
              </div>
              <div>
                <strong className="mb-1 block text-2xl">42</strong>
                <span className="text-[var(--text-muted)]">Seats left</span>
              </div>
              <div>
                <strong className="mb-1 block text-2xl">4.9</strong>
                <span className="text-[var(--text-muted)]">Rating</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Why People Use It
          </p>
          <h3 className="mb-3 text-[1.05rem]">
            One place for events, tickets, and personal account access
          </h3>
          <p className="leading-[1.7] text-[var(--text-muted)]">
            The experience is built around quick login, polished browsing, and a
            clear member area where users can manage their profile and future
            bookings.
          </p>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Included Flows
          </p>
          <h3 className="mb-3 text-[1.05rem]">
            Register, sign in, explore, review tickets, manage your account
          </h3>
          <p className="leading-[1.7] text-[var(--text-muted)]">
            Authentication is connected to the backend today, while event and
            booking-oriented product pages are already designed as realistic app
            experiences.
          </p>
        </article>
      </section>
    </main>
  );
}
