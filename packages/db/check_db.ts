
import { db } from "./src/index.js";
import { users } from "./src/schema/users.js";
import { eq } from "drizzle-orm";

async function check() {
    try {
        console.log("Checking users table...");
        const result = await db.select().from(users).limit(1);
        console.log("Select success:", result);
    } catch (e) {
        console.error("Select failed:", e);
    }
}

check();
