// ------------------------------------------------------------------
// src/components/ConfirmModal.jsx  —  Modern Confirmation Dialog Modal
// ------------------------------------------------------------------

import { useEffect } from "react";
import { IconTrash, IconX } from "./Icons.jsx";

export default function ConfirmModal({
  isOpen,
  title = "Delete Note",
  message = "Are you sure you want to delete this note? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button className="modal-close-btn" onClick={onCancel} aria-label="Close modal">
          <IconX size={18} />
        </button>

        <div className="modal-header">
          <div className={`modal-icon-badge ${isDanger ? "modal-icon-badge--danger" : ""}`}>
            <IconTrash size={22} />
          </div>
          <div>
            <h3 id="modal-title" className="modal-title">{title}</h3>
            <p className="modal-message">{message}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? "btn--danger" : "btn--primary"}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
