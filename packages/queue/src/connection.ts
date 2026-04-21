import { Redis } from "ioredis";

let connection: any | null = null;

export function getRedisConnection(): any {
    if (!connection) {
        const url = process.env.REDIS_URL;
        if (!url) {
            console.warn("⚠️  REDIS_URL not found. Background queues will be disabled.");
            return null;
        }

        try {
            connection = new Redis(url, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                // Add a small retry delay to avoid rapid-fire spam
                retryStrategy(times) {
                    return Math.min(times * 1000, 10000);
                },
            });

            // Catch connection errors to prevent unhandled rejections/spam
            connection.on("error", (err: any) => {
                if (err.code === "ECONNREFUSED") {
                    // Suppress the wall of text for a simple warning if it's just a refusal
                    if (process.env.NODE_ENV === "development") {
                        console.warn("⚠️  Redis connection refused at localhost:6379. Dev features enabled without cache.");
                    }
                } else {
                    console.error("❌ Redis Error:", err);
                }
            });
        } catch (e) {
            console.warn("⚠️  Failed to initialize Redis. Queues disabled.", e);
            return null;
        }
    }
    return connection;
}

export async function closeRedisConnection(): Promise<void> {
    if (connection) {
        await connection.quit();
        connection = null;
    }
}
