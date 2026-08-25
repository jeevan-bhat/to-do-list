// ------------------------------------------------------------------
// models/Note.js
// ------------------------------------------------------------------
// Defines the shape of a "Note" document in MongoDB using a Mongoose
// schema. A schema describes which fields a note has, their types, and
// any validation rules. Mongoose then gives us a Model (Note) with
// handy methods like Note.find(), Note.create(), Note.findById(), etc.
// ------------------------------------------------------------------

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    // The note's title. Required and trimmed of surrounding whitespace.
    title: {
      type: String,
      required: [true, "A note must have a title"],
      trim: true,
      maxlength: [120, "Title cannot be longer than 120 characters"],
    },

    // The body/content of the note. Optional.
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: [10000, "Content is too long"],
    },

    // Category / Tag to organize notes (e.g. Work, Personal, Ideas, Todo, Study, Quotes).
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: [50, "Category cannot be longer than 50 characters"],
    },

    // Visual color theme accent (e.g. amber, emerald, indigo, rose, sky, violet).
    color: {
      type: String,
      default: "amber",
      trim: true,
    },

    // Whether this note is pinned to the top of the list.
    pinned: {
      type: Boolean,
      default: false,
    },

    // Optional tags array for future tagging or quick filtering.
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    // Automatically add "createdAt" and "updatedAt" timestamp fields.
    timestamps: true,

    // Clean up what the JSON API returns:
    //  - expose "id" instead of the raw "_id"
    //  - hide the internal "__v" version key
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// The model name "Note" maps to the "notes" collection in MongoDB.
module.exports = mongoose.model("Note", noteSchema);
