import mongoose from "mongoose";

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

if (!globalThis.__mongooseCache) {
  globalThis.__mongooseCache = {
    conn: null,
    promise: null,
  };
}

const cached = globalThis.__mongooseCache;

export const getDatabaseStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    state: connectionStates[stateCode] || "unknown",
    stateCode,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
  };
};

export const connectToDatabase = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV !== "production"
      ? "mongodb://localhost:27017/expense-tracker"
      : null);

  if (cached.conn) {
    return cached.conn;
  }

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};
