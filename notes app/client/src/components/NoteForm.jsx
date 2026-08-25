// ------------------------------------------------------------------
// src/components/NoteForm.jsx
// ------------------------------------------------------------------
// A modern, rich form for creating and editing notes.
// Supports Title, Content, Category tags, Color theme selection, and Pinning.
// ------------------------------------------------------------------

import { useEffect, useState, useRef } from "react";
import {
  IconPlus,
  IconCheck,
  IconPin,
  IconPinFilled,
  IconTag,
  IconPalette,
  IconX,
  IconSparkles,
} from "./Icons.jsx";

export const CATEGORIES = [
  { id: "General", label: "General", emoji: "📁", color: "#64748b" },
  { id: "Work", label: "Work", emoji: "💼", color: "#3b82f6" },
  { id: "Personal", label: "Personal", emoji: "🌿", color: "#10b981" },
  { id: "Ideas", label: "Ideas", emoji: "💡", color: "#f59e0b" },
  { id: "Todo", label: "Todo", emoji: "✅", color: "#ef4444" },
  { id: "Study", label: "Study", emoji: "📚", color: "#8b5cf6" },
  { id: "Quotes", label: "Quotes", emoji: "✨", color: "#ec4899" },
];

export const NOTE_COLORS = [
  { id: "amber", name: "Amber Gold", hex: "#f59e0b", bgVar: "--color-amber-bg", borderVar: "--color-amber-border" },
  { id: "emerald", name: "Emerald Mint", hex: "#10b981", bgVar: "--color-emerald-bg", borderVar: "--color-emerald-border" },
  { id: "indigo", name: "Vibrant Indigo", hex: "#6366f1", bgVar: "--color-indigo-bg", borderVar: "--color-indigo-border" },
  { id: "rose", name: "Rose Pink", hex: "#f43f5e", bgVar: "--color-rose-bg", borderVar: "--color-rose-border" },
  { id: "sky", name: "Sky Blue", hex: "#0ea5e9", bgVar: "--color-sky-bg", borderVar: "--color-sky-border" },
  { id: "violet", name: "Purple Violet", hex: "#a855f7", bgVar: "--color-violet-bg", borderVar: "--color-violet-border" },
];

export default function NoteForm({ onSubmit, editingNote, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [color, setColor] = useState("amber");
  const [pinned, setPinned] = useState(false);
  const [hint, setHint] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const titleInputRef = useRef(null);

  const isEditing = Boolean(editingNote);

  // Sync state with editingNote
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || "");
      setContent(editingNote.content || "");
      setCategory(editingNote.category || "General");
      setColor(editingNote.color || "amber");
      setPinned(Boolean(editingNote.pinned));
      setIsExpanded(true);
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    } else {
      setTitle("");
      setContent("");
      setCategory("General");
      setColor("amber");
      setPinned(false);
    }
    setHint("");
  }, [editingNote]);

  function handleSubmit(event) {
    if (event) event.preventDefault();

    if (!title.trim()) {
      setHint("Please provide a title for your note.");
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      color,
      pinned,
    });

    setHint("");

    if (!isEditing) {
      setTitle("");
      setContent("");
      setCategory("General");
      setColor("amber");
      setPinned(false);
      setIsExpanded(false);
    }
  }

  // Support Ctrl+Enter / Cmd+Enter to quickly save note
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  const activeColorObj = NOTE_COLORS.find((c) => c.id === color) || NOTE_COLORS[0];
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div
      className={`compose-card ${isEditing ? "compose-card--editing" : ""} ${
        isExpanded ? "compose-card--expanded" : ""
      }`}
      style={{ "--card-accent": activeColorObj.hex }}
    >
      <div className="compose-card__spine" />

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="compose-card__body">
        {/* Card Header & Pin action */}
        <div className="compose-card__top">
          <div className="compose-card__title-row">
            <span className="compose-card__badge-tag">
              <IconSparkles size={14} />
              {isEditing ? "Edit Note" : "Create Note"}
            </span>
            {isEditing && (
              <span className="editing-indicator">
                Updating &ldquo;{editingNote.title}&rdquo;
              </span>
            )}
          </div>

          <button
            type="button"
            className={`pin-toggle-btn ${pinned ? "pin-toggle-btn--active" : ""}`}
            onClick={() => setPinned(!pinned)}
            title={pinned ? "Unpin note" : "Pin note to top"}
            aria-label={pinned ? "Unpin note" : "Pin note to top"}
          >
            {pinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
            <span>{pinned ? "Pinned to Top" : "Pin"}</span>
          </button>
        </div>

        {/* Title input */}
        <div className="field-group">
          <div className="field-header">
            <label htmlFor="note-title" className="field-label">Title</label>
            <span className="char-counter">{title.length}/120</span>
          </div>
          <input
            id="note-title"
            ref={titleInputRef}
            className="compose-input compose-input--title"
            type="text"
            placeholder="Note title (e.g., Project Roadmap, Ideas)..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (hint) setHint("");
            }}
            onFocus={() => setIsExpanded(true)}
            maxLength={120}
            autoComplete="off"
          />
        </div>

        {/* Expandable options & Content Area */}
        {(isExpanded || isEditing) && (
          <div className="compose-card__expanded-content">
            {/* Note Content Textarea */}
            <div className="field-group">
              <div className="field-header">
                <label htmlFor="note-content" className="field-label">Content</label>
                <span className="word-counter">
                  {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
                </span>
              </div>
              <textarea
                id="note-content"
                className="compose-textarea"
                placeholder="Write your note details here... (supports multiline text, lists, snippets)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            {/* Customization Bar: Categories + Colors */}
            <div className="compose-customization-bar">
              {/* Category selector */}
              <div className="customization-section">
                <span className="customization-label">
                  <IconTag size={13} /> Category
                </span>
                <div className="category-chips">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-chip ${category === cat.id ? "category-chip--selected" : ""}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span className="category-chip__emoji">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color swatch picker */}
              <div className="customization-section">
                <span className="customization-label">
                  <IconPalette size={13} /> Color Accent
                </span>
                <div className="color-swatches">
                  {NOTE_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      className={`color-swatch ${color === col.id ? "color-swatch--active" : ""}`}
                      style={{ backgroundColor: col.hex }}
                      onClick={() => setColor(col.id)}
                      title={col.name}
                      aria-label={col.name}
                    >
                      {color === col.id && <IconCheck size={13} className="color-swatch__check" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Message */}
            {hint && (
              <div className="form-alert form-alert--warning" role="alert">
                <span>⚠️ {hint}</span>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="compose-actions">
              <div className="keyboard-tip">
                <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save
              </div>

              <div className="action-buttons-group">
                {isEditing ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={onCancelEdit}
                  >
                    <IconX size={15} />
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setTitle("");
                      setContent("");
                      setCategory("General");
                      setColor("amber");
                      setPinned(false);
                      setIsExpanded(false);
                    }}
                  >
                    Clear
                  </button>
                )}

                <button
                  type="submit"
                  className="btn btn--primary btn--with-gradient"
                  disabled={isSubmitting}
                >
                  {isEditing ? (
                    <>
                      <IconCheck size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <IconPlus size={16} />
                      Add Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
