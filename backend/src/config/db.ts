// src/config/db.ts (or wherever this file is)
import mongoose from "mongoose";

export async function connectDB(mongoUri: string) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, { autoIndex: true });
    
    // ADD THIS LINE:
    console.log("✅ MongoDB Connected successfully!");
    
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Stop the server if DB fails
  }
}
