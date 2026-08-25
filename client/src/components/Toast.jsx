// ------------------------------------------------------------------
// src/components/Toast.jsx  —  Animated Toast Notification
// ------------------------------------------------------------------

import { useEffect } from "react";
import { IconCheck, IconX } from "./Icons.jsx";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container toast--${type}`} role="alert">
      <div className="toast-content">
        <span className="toast-icon">
          {type === "success" ? <IconCheck size={16} /> : <span style={{ fontSize: "14px" }}>⚠️</span>}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Close notification">
        <IconX size={14} />
      </button>
    </div>
  );
}
