// ------------------------------------------------------------------
// src/App.jsx  —  Main Application Component
// ------------------------------------------------------------------
// Manages application state, theme switching, search/filter, sorting,
// view toggles, toast notifications, confirmation modals, and API calls.
// ------------------------------------------------------------------

import { useEffect, useState, useMemo } from "react";
import NoteForm, { CATEGORIES } from "./components/NoteForm.jsx";
import NoteList from "./components/NoteList.jsx";
import Toast from "./components/Toast.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import {
  IconSearch,
  IconSun,
  IconMoon,
  IconGrid,
  IconList,
  IconSort,
  IconX,
  IconSparkles,
  IconFolder,
} from "./components/Icons.jsx";
import { getNotes, createNote, updateNote, deleteNote } from "./api.js";
import "./App.css";

// Dynamic SVG Brand Mark
function BrandLogo() {
  return (
    <div className="brand-logo-container">
      <svg className="brand-logo-svg" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#brandGrad)" filter="url(#glow)" />
        <path d="M28 6 H32 A10 10 0 0 1 42 16 V20 Z" fill="#4338ca" opacity="0.4" />
        <rect x="13" y="16" width="22" height="3" rx="1.5" fill="#ffffff" opacity="0.95" />
        <rect x="13" y="23" width="22" height="3" rx="1.5" fill="#ffffff" opacity="0.75" />
        <rect x="13" y="30" width="14" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
      </svg>
    </div>
  );
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search, Category, Sorting & View state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, title, pinned
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Modal & Toast state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, note: null });
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Dark/Light Theme state (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("notes_app_theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply theme to root document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("notes_app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ---- Initial Data Fetch --------------------------------------------
  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
      setError("");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ---- Create or Update Note -----------------------------------------
  async function handleSubmit(formData) {
    try {
      setIsSubmitting(true);
      if (editingNote) {
        const id = editingNote.id || editingNote._id;
        const updated = await updateNote(id, formData);
        setNotes((prev) =>
          prev.map((n) => ((n.id || n._id) === id ? updated : n))
        );
        setEditingNote(null);
        showToast("Note updated successfully!", "success");
      } else {
        const created = await createNote(formData);
        setNotes((prev) => [created, ...prev]);
        showToast("New note created!", "success");
      }
      setError("");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Pin / Unpin Note ---------------------------------------------
  async function handleTogglePin(note) {
    try {
      const id = note.id || note._id;
      const updatedPinned = !note.pinned;
      const updated = await updateNote(id, { pinned: updatedPinned });
      setNotes((prev) =>
        prev.map((n) => ((n.id || n._id) === id ? updated : n))
      );
      showToast(
        updatedPinned ? "Note pinned to top!" : "Note unpinned.",
        "success"
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // ---- Delete Note Confirmation --------------------------------------
  function handleDeleteRequest(note) {
    setDeleteModal({ isOpen: true, note });
  }

  async function handleConfirmDelete() {
    if (!deleteModal.note) return;
    const noteId = deleteModal.note.id || deleteModal.note._id;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== noteId));
      if (editingNote && (editingNote.id || editingNote._id) === noteId) {
        setEditingNote(null);
      }
      showToast("Note deleted.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleteModal({ isOpen: false, note: null });
    }
  }

  // ---- Filter and Sort Notes -----------------------------------------
  const filteredAndSortedNotes = useMemo(() => {
    let list = [...notes];

    // Filter by search query (title or content)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (selectedCategory !== "All") {
      list = list.filter((n) => n.category === selectedCategory);
    }

    // Sort
    list.sort((a, b) => {
      // Pinned notes are always kept on top unless sorting by a specific non-pinned rule
      if (sortBy === "newest") {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "title") {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return list;
  }, [notes, searchQuery, selectedCategory, sortBy]);

  // Total stats
  const totalNotes = notes.length;
  const pinnedCount = notes.filter((n) => n.pinned).length;

  return (
    <div className="app-wrapper">
      {/* Toast Notification Container */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Note?"
        message={
          deleteModal.note
            ? `Are you sure you want to permanently delete "${deleteModal.note.title}"?`
            : "Are you sure you want to delete this note?"
        }
        confirmLabel="Delete Note"
        cancelLabel="Keep Note"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, note: null })}
        isDanger={true}
      />

      {/* Top Header & Navigation */}
      <header className="app-header">
        <div className="app-header__content">
          <div className="brand-section">
            <BrandLogo />
            <div className="brand-text">
              <div className="brand-title-row">
                <h1 className="brand-name">Notes</h1>
                <span className="brand-version-badge">PRO</span>
              </div>
              <p className="brand-tagline">Capture, organize, and remember effortlessly</p>
            </div>
          </div>

          <div className="header-actions">
            {/* Quick Stats Pill */}
            <div className="stats-pill" title="Total notes in workspace">
              <span className="stats-pill__icon">📝</span>
              <span className="stats-pill__count">{totalNotes}</span>
              <span className="stats-pill__label">notes</span>
              {pinnedCount > 0 && (
                <span className="stats-pill__pinned">· {pinnedCount} pinned</span>
              )}
            </div>

            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <IconSun size={19} /> : <IconMoon size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Compose Form */}
        <NoteForm
          onSubmit={handleSubmit}
          editingNote={editingNote}
          onCancelEdit={() => setEditingNote(null)}
          isSubmitting={isSubmitting}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="error-banner" role="alert">
            <span className="error-banner__icon">⚠️</span>
            <span className="error-banner__text">{error}</span>
            <button
              type="button"
              className="error-banner__retry"
              onClick={loadNotes}
            >
              Retry
            </button>
          </div>
        )}

        {/* Search, Filter & Control Toolbar */}
        <div className="toolbar">
          {/* Search Bar */}
          <div className="search-bar">
            <IconSearch size={17} className="search-bar__icon" />
            <input
              type="text"
              className="search-bar__input"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-bar__clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <IconX size={15} />
              </button>
            )}
          </div>

          {/* Controls: Sorting & View Switch */}
          <div className="toolbar__controls">
            <div className="sort-dropdown-wrap">
              <IconSort size={15} className="sort-icon" />
              <select
                className="select-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort notes"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>

            <div className="view-toggle-wrap">
              <button
                type="button"
                className={`view-btn ${viewMode === "grid" ? "view-btn--active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
                aria-label="Grid View"
              >
                <IconGrid size={16} />
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === "list" ? "view-btn--active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
                aria-label="List View"
              >
                <IconList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-tabs-scroll">
          <div className="category-tabs">
            <button
              type="button"
              className={`category-tab ${selectedCategory === "All" ? "category-tab--active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              <span className="category-tab__emoji">✨</span>
              <span>All Notes</span>
              <span className="category-tab__badge">{notes.length}</span>
            </button>

            {CATEGORIES.map((cat) => {
              const count = notes.filter((n) => n.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tab ${
                    selectedCategory === cat.id ? "category-tab--active" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-tab__emoji">{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {count > 0 && <span className="category-tab__badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicator Bar */}
        {(searchQuery || selectedCategory !== "All") && (
          <div className="active-filters-bar">
            <span className="active-filters-label">
              Showing {filteredAndSortedNotes.length} matching {filteredAndSortedNotes.length === 1 ? "note" : "notes"}
            </span>
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Notes Grid / Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Loading your notes...</p>
          </div>
        ) : (
          <NoteList
            notes={filteredAndSortedNotes}
            onEdit={(note) => {
              setEditingNote(note);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDeleteRequest={handleDeleteRequest}
            onTogglePin={handleTogglePin}
            onCopySuccess={(msg) => showToast(msg, "success")}
            isListView={viewMode === "list"}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearFilters={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="app-footer__text">
          Notes App &bull; Crafted with React, Node.js & MongoDB
        </p>
      </footer>
    </div>
  );
}
