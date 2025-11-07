// src/config/database.ts
import { PrismaClient } from "@prisma/client";

// Create a singleton instance
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
