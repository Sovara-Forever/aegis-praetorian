import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export * from "./schema";
