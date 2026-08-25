// ------------------------------------------------------------------
// server.js  —  application entry point
// ------------------------------------------------------------------
// This file wires everything together:
//   1. Loads environment variables from .env
//   2. Creates the Express app and applies middleware (CORS, JSON parser)
//   3. Mounts the notes API routes at /api/notes
//   4. Connects to MongoDB, then starts listening for requests
//
// Run it with:   npm run dev   (auto-reload)   or   npm start
// ------------------------------------------------------------------

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const path = require("path");
const { connectDB, disconnectDB } = require("./config/db");
const notesRouter = require("./routes/notes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// ---- Global middleware --------------------------------------------

// Allow the React dev server (a different port) to call this API.
app.use(cors({ origin: process.env.NODE_ENV === "production" ? true : CLIENT_ORIGIN }));

// Parse incoming JSON request bodies into req.body.
app.use(express.json());

// Log every request in a simple "METHOD /url" format.
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---- API Routes ---------------------------------------------------

// Simple health-check endpoint so you can confirm the server is up.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Notes API is running" });
});

// All note CRUD endpoints live under /api/notes.
app.use("/api/notes", notesRouter);

// ---- Production Static Serving ------------------------------------
const clientDist = path.join(__dirname, "../client/dist");

app.use(express.static(clientDist));

app.get("*", (req, res, next) => {
  // If request starts with /api/, pass to 404 handler
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
  }
  // Otherwise send the React app's index.html
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// If no route matched, return a 404 JSON response.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Central error handler (must be registered last).
app.use(errorHandler);

// ---- Start up -----------------------------------------------------

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });

    // Gracefully close the DB connection on Ctrl+C / termination.
    const shutdown = async () => {
      console.log("\nShutting down...");
      server.close();
      await disconnectDB();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
