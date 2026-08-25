// ------------------------------------------------------------------
// src/components/NoteList.jsx
// ------------------------------------------------------------------
// Renders the collection of notes, grouped into Pinned and Regular notes.
// Supports Grid / List layouts, empty states, and filter feedback.
// ------------------------------------------------------------------

import NoteItem from "./NoteItem.jsx";
import { IconPinFilled, IconSparkles, IconX } from "./Icons.jsx";

export default function NoteList({
  notes,
  onEdit,
  onDeleteRequest,
  onTogglePin,
  onCopySuccess,
  isListView = false,
  searchQuery = "",
  selectedCategory = "All",
  onClearFilters,
}) {
  // Empty state: No notes in database at all
  if (notes.length === 0 && !searchQuery && selectedCategory === "All") {
    return (
      <div className="empty-board">
        <div className="empty-board__illustration">
          <div className="empty-board__icon-wrap">
            <IconSparkles size={36} />
          </div>
        </div>
        <h3 className="empty-board__title">Your canvas is empty</h3>
        <p className="empty-board__subtitle">
          Capture thoughts, ideas, todos, and meeting notes using the form above.
        </p>
      </div>
    );
  }

  // Filtered empty state: No notes matching current search or category
  if (notes.length === 0) {
    return (
      <div className="empty-board empty-board--filtered">
        <div className="empty-board__illustration">
          <div className="empty-board__icon-wrap empty-board__icon-wrap--dim">
            🔍
          </div>
        </div>
        <h3 className="empty-board__title">No notes found</h3>
        <p className="empty-board__subtitle">
          {searchQuery && selectedCategory !== "All" ? (
            <>
              No notes found for &ldquo;<strong>{searchQuery}</strong>&rdquo; in category &ldquo;<strong>{selectedCategory}</strong>&rdquo;.
            </>
          ) : searchQuery ? (
            <>
              No notes matching &ldquo;<strong>{searchQuery}</strong>&rdquo;.
            </>
          ) : (
            <>
              No notes found in the &ldquo;<strong>{selectedCategory}</strong>&rdquo; category.
            </>
          )}
        </p>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={onClearFilters}
        >
          <IconX size={14} />
          Clear filters
        </button>
      </div>
    );
  }

  // Divide notes into pinned and others if there are pinned notes
  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  const hasPinned = pinnedNotes.length > 0;

  return (
    <section className="notes-container">
      {/* Pinned Section */}
      {hasPinned && (
        <div className="notes-section">
          <div className="notes-section__header">
            <span className="section-title-badge section-title-badge--pinned">
              <IconPinFilled size={13} />
              Pinned Notes
            </span>
            <span className="section-count">{pinnedNotes.length}</span>
          </div>

          <ul className={`notes-layout ${isListView ? "notes-layout--list" : "notes-layout--grid"}`}>
            {pinnedNotes.map((note, index) => (
              <NoteItem
                key={note.id || note._id}
                note={note}
                index={index}
                onEdit={onEdit}
                onDeleteRequest={onDeleteRequest}
                onTogglePin={onTogglePin}
                onCopySuccess={onCopySuccess}
                isListView={isListView}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Regular / Other Notes Section */}
      <div className="notes-section">
        {hasPinned && otherNotes.length > 0 && (
          <div className="notes-section__header">
            <span className="section-title-badge">
              All Notes
            </span>
            <span className="section-count">{otherNotes.length}</span>
          </div>
        )}

        {(!hasPinned || otherNotes.length > 0) && (
          <ul className={`notes-layout ${isListView ? "notes-layout--list" : "notes-layout--grid"}`}>
            {(hasPinned ? otherNotes : notes).map((note, index) => (
              <NoteItem
                key={note.id || note._id}
                note={note}
                index={hasPinned ? index + pinnedNotes.length : index}
                onEdit={onEdit}
                onDeleteRequest={onDeleteRequest}
                onTogglePin={onTogglePin}
                onCopySuccess={onCopySuccess}
                isListView={isListView}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
