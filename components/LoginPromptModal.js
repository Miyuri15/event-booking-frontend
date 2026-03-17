"use client";

import Link from "next/link";

export default function LoginPromptModal({ isOpen, eventTitle, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[rgba(17,17,17,0.45)] p-4"
      onClick={onCancel}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="max-h-[90vh] w-[min(560px,100%)] overflow-auto rounded-[28px] border border-[rgba(54,45,32,0.1)] bg-[#fffaf4] p-6 shadow-[0_30px_70px_rgba(17,17,17,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div>
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Sign In Required
          </p>
          <h3 className="mb-3 text-[1.05rem]">
            Create an account or sign in to book this event
          </h3>
          <p className="leading-[1.7] text-[var(--text-muted)]">
            {eventTitle ? (
              <>
                To complete your booking for <strong>{eventTitle}</strong>, you
                need to sign in or create an account. It only takes a minute!
              </>
            ) : (
              <>
                To complete your booking, you need to sign in or create an
                account. It only takes a minute!
              </>
            )}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-[repeat(2,auto)] justify-end gap-4 max-[900px]:grid-cols-1">
          <button
            className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
            onClick={onCancel}
            type="button"
          >
            Continue Browsing
          </button>
          <Link
            href="/auth"
            className="cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-center text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
          >
            Sign In / Register
          </Link>
        </div>
      </section>
    </div>
  );
}
