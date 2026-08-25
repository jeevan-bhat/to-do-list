// ------------------------------------------------------------------
// models/Note.js  —  Resilient Model with Dual Engine (Mongoose + In-Memory)
// ------------------------------------------------------------------
// Works seamlessly with MongoDB Atlas / Local MongoDB when connected.
// If no MongoDB instance is reachable (e.g. initial Render deployment
// before configuring MONGODB_URI), it uses an in-memory store so the app
// is ALWAYS 100% online and NEVER crashes or hangs.
// ------------------------------------------------------------------

const mongoose = require("mongoose");
const crypto = require("crypto");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A note must have a title"],
      trim: true,
      maxlength: [120, "Title cannot be longer than 120 characters"],
    },
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: [10000, "Content is too long"],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: [50, "Category cannot be longer than 50 characters"],
    },
    color: {
      type: String,
      default: "amber",
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const MongooseNote = mongoose.model("Note", noteSchema);

// In-Memory fallback store
let inMemoryNotes = [
  {
    id: "note-1",
    title: "🚀 Launch Strategy & Q4 Roadmap",
    content: "Finalize the production deployment checklist, configure monitoring alerts, and sync with the design team on UI polish.",
    category: "Work",
    color: "indigo",
    pinned: true,
    tags: ["roadmap", "q4"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "note-2",
    title: "💡 Micro-SaaS Product Ideas",
    content: "1. AI-powered markdown documentation formatter\n2. Instant code snippet organizer with tagging\n3. Smart bookmark manager with automated summaries",
    category: "Ideas",
    color: "amber",
    pinned: true,
    tags: ["ideas", "saas"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "note-3",
    title: "📚 Weekend Reading List",
    content: "- Designing Data-Intensive Applications (Kleppmann)\n- Refactoring UI (Wathan & Schoger)\n- Clean Code Architecture",
    category: "Study",
    color: "violet",
    pinned: false,
    tags: ["books", "reading"],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "note-4",
    title: "🌿 Daily Workout & Mindfulness Routine",
    content: "Morning run (5km), 20 min stretching, 10 min guided meditation, 3L water intake goal.",
    category: "Personal",
    color: "emerald",
    pinned: false,
    tags: ["health", "routine"],
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

const NoteWrapper = {
  find(query = {}) {
    if (isDbConnected()) {
      return MongooseNote.find(query);
    }
    // Return in-memory with sort chain simulation
    return {
      sort(sortObj = { pinned: -1, createdAt: -1 }) {
        let results = [...inMemoryNotes];
        results.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return Promise.resolve(results);
      },
      then(resolve) {
        return this.sort().then(resolve);
      },
    };
  },

  async findById(id) {
    if (isDbConnected()) {
      return await MongooseNote.findById(id);
    }
    const note = inMemoryNotes.find((n) => n.id === id || n._id === id);
    return note || null;
  },

  async create(data) {
    if (isDbConnected()) {
      return await MongooseNote.create(data);
    }
    const now = new Date().toISOString();
    const newNote = {
      id: "note-" + crypto.randomBytes(6).toString("hex"),
      title: data.title || "",
      content: data.content || "",
      category: data.category || "General",
      color: data.color || "amber",
      pinned: Boolean(data.pinned),
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: now,
      updatedAt: now,
    };
    inMemoryNotes.unshift(newNote);
    return newNote;
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    if (isDbConnected()) {
      return await MongooseNote.findByIdAndUpdate(id, updateData, options);
    }
    const index = inMemoryNotes.findIndex((n) => n.id === id || n._id === id);
    if (index === -1) return null;

    const existing = inMemoryNotes[index];
    const updated = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    inMemoryNotes[index] = updated;
    return updated;
  },

  async findByIdAndDelete(id) {
    if (isDbConnected()) {
      return await MongooseNote.findByIdAndDelete(id);
    }
    const index = inMemoryNotes.findIndex((n) => n.id === id || n._id === id);
    if (index === -1) return null;
    const deleted = inMemoryNotes.splice(index, 1)[0];
    return deleted;
  },
};

module.exports = NoteWrapper;
