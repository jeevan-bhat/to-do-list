// ------------------------------------------------------------------
// config/db.js
// ------------------------------------------------------------------
// Responsible for connecting the Express app to MongoDB using Mongoose.
//
// How it works:
//   1. It first tries to connect to the MongoDB server defined by the
//      MONGODB_URI environment variable (your local MongoDB or Atlas).
//   2. If that connection fails (e.g. you don't have MongoDB installed),
//      and the fallback is enabled, it spins up an *in-memory* MongoDB
//      using "mongodb-memory-server" so the app still runs.
//
// The in-memory database is perfect for demos and assignments because it
// requires zero setup. Note: data stored there disappears when the server
// stops. For persistent data, run a real MongoDB (see README).
// ------------------------------------------------------------------

const mongoose = require("mongoose");

// Keep a reference to the in-memory server (if we start one) so we can
// stop it cleanly when the app shuts down.
let memoryServer = null;

/**
 * Connect to MongoDB.
 * Returns the connection type actually used: "external" or "in-memory".
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/notesapp";
  const allowFallback = process.env.USE_MEMORY_DB_FALLBACK !== "false";

  // Mongoose logs the exact query that fails; keep it strict & predictable.
  mongoose.set("strictQuery", true);

  try {
    // Short timeout so we don't hang for 30s when no local MongoDB exists.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ Connected to MongoDB at ${uri}`);
    return "external";
  } catch (err) {
    console.warn(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.warn(`   Reason: ${err.message}`);

    if (!allowFallback) {
      // Fallback disabled — rethrow so the server startup fails loudly.
      throw err;
    }

    // ----------------------------------------------------------------
    // Fallback: start a disposable in-memory MongoDB.
    // We require the package lazily so it's only loaded when needed.
    // ----------------------------------------------------------------
    console.log("↩️  Falling back to an in-memory MongoDB (data is temporary)...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("✅ Connected to in-memory MongoDB");
    return "in-memory";
  }
}

/**
 * Cleanly close the DB connection (and stop the in-memory server if used).
 * Called when the process is shutting down.
 */
async function disconnectDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
