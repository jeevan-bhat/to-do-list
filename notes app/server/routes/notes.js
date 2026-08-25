// ------------------------------------------------------------------
// routes/notes.js
// ------------------------------------------------------------------
// Defines the REST API endpoints for notes. Each endpoint maps an HTTP
// method + URL to a piece of database logic:
//
//   GET    /api/notes       -> list all notes
//   GET    /api/notes/:id   -> get a single note
//   POST   /api/notes       -> create a new note
//   PUT    /api/notes/:id   -> update an existing note
//   DELETE /api/notes/:id   -> delete a note
//
// These five routes cover the full CRUD lifecycle:
//   Create (POST), Read (GET), Update (PUT), Delete (DELETE).
// ------------------------------------------------------------------

const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

/**
 * Small helper that wraps an async route handler so that any thrown
 * error (or rejected promise) is forwarded to Express's error handler
 * via next(err). This saves us from writing try/catch in every route.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ------------------------------------------------------------------
// READ ALL  ->  GET /api/notes
// Returns every note, pinned first, then newest first.
// ------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const notes = await Note.find().sort({ pinned: -1, createdAt: -1 });
    res.json(notes);
  })
);

// ------------------------------------------------------------------
// READ ONE  ->  GET /api/notes/:id
// Returns a single note by its id, or 404 if it doesn't exist.
// ------------------------------------------------------------------
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  })
);

// ------------------------------------------------------------------
// CREATE  ->  POST /api/notes
// Expects a JSON body: { "title": "...", "content": "...", "category": "...", "color": "...", "pinned": false }
// Returns the created note with status 201.
// ------------------------------------------------------------------
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, content, category, color, pinned, tags } = req.body;
    const note = await Note.create({
      title,
      content,
      category: category || "General",
      color: color || "amber",
      pinned: Boolean(pinned),
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json(note);
  })
);

// ------------------------------------------------------------------
// UPDATE  ->  PUT /api/notes/:id
// Updates note fields, then returns the updated note.
// { new: true } tells Mongoose to return the *updated* document.
// { runValidators: true } re-applies the schema validation rules.
// ------------------------------------------------------------------
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { title, content, category, color, pinned, tags } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (color !== undefined) updateData.color = color;
    if (pinned !== undefined) updateData.pinned = Boolean(pinned);
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  })
);

// ------------------------------------------------------------------
// DELETE  ->  DELETE /api/notes/:id
// Removes a note and confirms the deletion.
// ------------------------------------------------------------------
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted", id: req.params.id });
  })
);

module.exports = router;
