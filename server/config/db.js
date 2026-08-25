// ------------------------------------------------------------------
// config/db.js
// ------------------------------------------------------------------
// Responsible for connecting the Express app to MongoDB using Mongoose.
// Supports MongoDB Atlas, local MongoDB, and in-memory fallback.
// ------------------------------------------------------------------

const mongoose = require("mongoose");

let memoryServer = null;

/**
 * Connect to MongoDB.
 * Returns the connection type used: "external", "local", or "in-memory".
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const allowFallback = process.env.USE_MEMORY_DB_FALLBACK !== "false";

  mongoose.set("strictQuery", true);

  // 1. If explicit MONGODB_URI is provided (e.g. from MongoDB Atlas)
  if (uri && uri !== "mongodb://127.0.0.1:27017/notesapp") {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      const safeUri = uri.replace(/\/\/.*@/, "//<credentials>@");
      console.log(`✅ Connected to MongoDB Atlas at ${safeUri}`);
      return "external";
    } catch (err) {
      console.warn(`⚠️ Could not connect to external MongoDB: ${err.message}`);
      if (!allowFallback) throw err;
    }
  }

  // 2. Try default local MongoDB
  const localUri = uri || "mongodb://127.0.0.1:27017/notesapp";
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2500 });
    console.log(`✅ Connected to local MongoDB at ${localUri}`);
    return "local";
  } catch (err) {
    if (!allowFallback) throw err;
  }

  // 3. Fallback: In-memory MongoDB
  try {
    console.log("↩️  Falling back to in-memory MongoDB...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("✅ Connected to in-memory MongoDB (temporary storage)");
    return "in-memory";
  } catch (memErr) {
    console.warn("⚠️ In-memory MongoDB could not be started:", memErr.message);
    console.warn("💡 Tip: For persistent storage on Render, set MONGODB_URI in Render Dashboard → Environment Variables.");
  }
}

/**
 * Cleanly close the DB connection (and stop the in-memory server if used).
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.error("Error during DB disconnect:", err.message);
  }
}

module.exports = { connectDB, disconnectDB };
