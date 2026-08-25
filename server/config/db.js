// ------------------------------------------------------------------
// config/db.js
// ------------------------------------------------------------------
// Connects to MongoDB Atlas or local MongoDB using Mongoose.
// If no external MongoDB is reachable, the application seamlessly
// uses the zero-overhead built-in memory store in models/Note.js.
// ------------------------------------------------------------------

const mongoose = require("mongoose");

/**
 * Connect to MongoDB.
 * Returns true if connected to MongoDB Atlas / local MongoDB, false otherwise.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  mongoose.set("strictQuery", true);

  // 1. If explicit MONGODB_URI is provided (e.g. from MongoDB Atlas)
  if (uri && uri !== "mongodb://127.0.0.1:27017/notesapp") {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      const safeUri = uri.replace(/\/\/.*@/, "//<credentials>@");
      console.log(`✅ Connected to MongoDB Atlas: ${safeUri}`);
      return true;
    } catch (err) {
      console.warn(`⚠️ Could not connect to external MongoDB: ${err.message}`);
    }
  }

  // 2. Try default local MongoDB
  const localUri = uri || "mongodb://127.0.0.1:27017/notesapp";
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`✅ Connected to local MongoDB: ${localUri}`);
    return true;
  } catch (err) {
    // Local DB not running
  }

  // 3. Fast built-in in-memory fallback
  console.log("⚡ Running with built-in instant in-memory storage engine.");
  console.log("💡 Tip: For persistent storage, set MONGODB_URI in Render Dashboard → Environment Variables.");
  return false;
}

/**
 * Cleanly close the DB connection when the server is shutting down.
 */
async function disconnectDB() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error("Error during DB disconnect:", err.message);
  }
}

module.exports = { connectDB, disconnectDB };
