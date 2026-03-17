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
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <section
        aria-modal="true"
        className="modal-card modal-card-compact"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{isDanger ? "Please Confirm" : "Action Required"}</p>
            <h3>{title}</h3>
            <p className="section-copy">{description}</p>
          </div>
        </div>

        <div className="modal-actions modal-actions-inline">
          <button className="secondary-button" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={isDanger ? "danger-button" : "primary-button"}
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
