
import { db } from "./src/index.js";
import { sql } from "drizzle-orm";

async function checkTables() {
    try {
        console.log("Fetching table list...");
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables in public schema:", result);
    } catch (e) {
        console.error("Failed to fetch tables:", e);
    }
}

checkTables();
