// test-env.js
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL : "❌ Not found");
