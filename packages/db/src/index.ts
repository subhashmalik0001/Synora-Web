import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL || "";

if (connectionString) {
    const maskedUrl = connectionString.includes("@") 
        ? connectionString.split("@")[1].split("/")[0] 
        : "Found (Local/Proxy)";
    console.log(`[DB_INIT] 🔌 Connected to database via: ${maskedUrl}`);
} else {
    console.error("[DB_INIT] ❌ CRITICAL: DATABASE_URL is missing in environment!");
}

const client = postgres(connectionString || "postgres://dummy", { 
    prepare: false,
    connect_timeout: 5000,
});

export const db = drizzle(client as any, { schema: schema as any }) as any as ReturnType<typeof drizzle<typeof schema>>;

export type Database = typeof db;

export * from "./schema/index.js";
