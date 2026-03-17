import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Live Experiences, Reimagined</p>
          <h1>Find the next event worth leaving home for.</h1>
          <p className="section-copy landing-description">
            Browse standout concerts, startup meetups, creative workshops, and
            premium city events through a modern booking platform designed for fast
            discovery and smooth sign-in.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" href="/auth">
              Get Started
            </Link>
            <Link className="secondary-button" href="/dashboard">
              Enter Dashboard
            </Link>
          </div>
        </div>

        <div className="landing-stage">
          <article className="spotlight-card">
            <p className="eyebrow">Featured Tonight</p>
            <h2>Colombo After Dark Sessions</h2>
            <p className="section-copy">
              Rooftop music, curated dining, and a late-night visual experience
              made for memorable city weekends.
            </p>
            <div className="metric-row">
              <div>
                <strong>1.2K+</strong>
                <span>Interested</span>
              </div>
              <div>
                <strong>42</strong>
                <span>Seats left</span>
              </div>
              <div>
                <strong>4.9</strong>
                <span>Rating</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-grid">
        <article className="panel">
          <p className="eyebrow">Why People Use It</p>
          <h3>One place for events, tickets, and personal account access</h3>
          <p className="section-copy">
            The experience is built around quick login, polished browsing, and a
            clear member area where users can manage their profile and future
            bookings.
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Included Flows</p>
          <h3>Register, sign in, explore, review tickets, manage your account</h3>
          <p className="section-copy">
            Authentication is connected to the backend today, while event and
            booking-oriented product pages are already designed as realistic app
            experiences.
          </p>
        </article>
      </section>
    </main>
  );
}
