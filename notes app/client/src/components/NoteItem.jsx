// ------------------------------------------------------------------
// src/components/NoteItem.jsx
// ------------------------------------------------------------------
// A modern note card with category tag, color theme accent, pin badge,
// copy-to-clipboard, quick edit, and delete actions.
// ------------------------------------------------------------------

import { useState } from "react";
import {
  IconPinFilled,
  IconPin,
  IconEdit,
  IconTrash,
  IconCopy,
  IconCheck,
  IconCalendar,
} from "./Icons.jsx";
import { CATEGORIES, NOTE_COLORS } from "./NoteForm.jsx";

function formatTimestamp(createdStr, updatedStr) {
  const created = new Date(createdStr).getTime();
  const updated = updatedStr ? new Date(updatedStr).getTime() : created;
  const wasEdited = updated - created > 2000;
  const targetDate = new Date(wasEdited ? updated : created);

  const now = Date.now();
  const diffSec = Math.floor((now - targetDate.getTime()) / 1000);

  let relative = "";
  if (diffSec < 60) {
    relative = "Just now";
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins}m ago`;
  } else if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    relative = `${hours}h ago`;
  } else if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    relative = `${days}d ago`;
  } else {
    relative = targetDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return {
    label: wasEdited ? `Edited · ${relative}` : `Created · ${relative}`,
    fullDate: targetDate.toLocaleString(),
    wasEdited,
  };
}

export default function NoteItem({
  note,
  index = 0,
  onEdit,
  onDeleteRequest,
  onTogglePin,
  onCopySuccess,
  isListView = false,
}) {
  const [copied, setCopied] = useState(false);

  const categoryObj =
    CATEGORIES.find((c) => c.id === note.category) ||
    CATEGORIES.find((c) => c.id === "General");

  const colorObj =
    NOTE_COLORS.find((c) => c.id === note.color) ||
    NOTE_COLORS[index % NOTE_COLORS.length];

  const dateInfo = formatTimestamp(note.createdAt, note.updatedAt);

  async function handleCopy(e) {
    e.stopPropagation();
    try {
      const textToCopy = `${note.title}\n\n${note.content || ""}`.trim();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (onCopySuccess) onCopySuccess("Note copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  return (
    <li
      className={`note-card ${isListView ? "note-card--list" : ""} ${
        note.pinned ? "note-card--pinned" : ""
      }`}
      style={{
        "--note-accent": colorObj.hex,
        animationDelay: `${Math.min(index, 10) * 40}ms`,
      }}
    >
      <div className="note-card__accent-bar" />

      <div className="note-card__inner">
        {/* Header / Meta Bar */}
        <div className="note-card__header">
          <div className="note-card__tags">
            {categoryObj && (
              <span className="category-pill">
                <span className="category-pill__emoji">{categoryObj.emoji}</span>
                <span className="category-pill__text">{categoryObj.label}</span>
              </span>
            )}

            {note.pinned && (
              <span className="pinned-badge" title="Pinned to top">
                <IconPinFilled size={12} />
                <span>Pinned</span>
              </span>
            )}
          </div>

          <div className="note-card__quick-actions">
            <button
              type="button"
              className={`action-icon-btn ${note.pinned ? "action-icon-btn--pinned" : ""}`}
              onClick={() => onTogglePin(note)}
              title={note.pinned ? "Unpin note" : "Pin to top"}
              aria-label={note.pinned ? "Unpin note" : "Pin to top"}
            >
              {note.pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />}
            </button>

            <button
              type="button"
              className="action-icon-btn"
              onClick={handleCopy}
              title="Copy note text"
              aria-label="Copy note text"
            >
              {copied ? <IconCheck size={15} className="copied-check" /> : <IconCopy size={15} />}
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="note-card__title">{note.title}</h3>

        {/* Note Content */}
        {note.content && (
          <p className="note-card__content">{note.content}</p>
        )}

        {/* Footer info & CRUD Actions */}
        <div className="note-card__footer">
          <div className="note-card__date" title={dateInfo.fullDate}>
            <IconCalendar size={13} />
            <span>{dateInfo.label}</span>
          </div>

          <div className="note-card__controls">
            <button
              type="button"
              className="card-btn card-btn--edit"
              onClick={() => onEdit(note)}
              title="Edit note"
            >
              <IconEdit size={14} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="card-btn card-btn--delete"
              onClick={() => onDeleteRequest(note)}
              title="Delete note"
            >
              <IconTrash size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
