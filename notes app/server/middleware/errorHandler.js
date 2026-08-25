// ------------------------------------------------------------------
// middleware/errorHandler.js
// ------------------------------------------------------------------
// Express error-handling middleware. Any error passed to next(err) from
// a route ends up here, so we can translate common database errors into
// friendly HTTP responses instead of leaking stack traces to the client.
// ------------------------------------------------------------------

function errorHandler(err, req, res, next) {
  // Log the full error on the server for debugging.
  console.error("❌ Error:", err.message);

  // Mongoose validation failed (e.g. missing required "title").
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Malformed MongoDB ObjectId in the URL (e.g. /api/notes/abc).
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid id: ${err.value}` });
  }

  // Anything else: generic 500.
  res.status(500).json({ message: err.message || "Internal server error" });
}

module.exports = errorHandler;
