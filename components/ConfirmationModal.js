"use client";

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(17,17,17,0.45)] p-4" onClick={onCancel} role="presentation">
      <section
        aria-modal="true"
        className="max-h-[90vh] w-[min(560px,100%)] overflow-auto rounded-[28px] border border-[rgba(54,45,32,0.1)] bg-[#fffaf4] p-6 shadow-[0_30px_70px_rgba(17,17,17,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 max-[900px]:grid-cols-1">
          <div>
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">{isDanger ? "Please Confirm" : "Action Required"}</p>
            <h3 className="mb-3 text-[1.05rem]">{title}</h3>
            <p className="leading-[1.7] text-[var(--text-muted)]">{description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[repeat(2,auto)] justify-end gap-4 max-[900px]:grid-cols-1">
          <button className="cursor-pointer rounded-full border border-[rgba(33,83,79,0.18)] bg-[rgba(33,83,79,0.1)] px-[1.35rem] py-[0.95rem] text-[var(--secondary)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={isDanger ? "cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,#b63d3d_0%,#d45a5a_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(182,61,61,0.22)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px" : "cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"}
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
