import { Queue } from "bullmq";

import { QUEUE_NAMES, JOB_NAMES, getRedisConnection } from "@paygate/queue";

import { startJobWorkers } from "./jobs/index.js";

// ─── Register repeatable (cron) jobs ─────────────────
async function registerSchedules() {
    const connection = getRedisConnection();
    const billingQueue = new Queue(QUEUE_NAMES.BILLING, { connection });
    const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, { connection });

    // Every hour: check for expired subscriptions
    await billingQueue.upsertJobScheduler(
        "enforce-expiry-schedule",
        { pattern: "0 * * * *" },
        {
            name: JOB_NAMES.ENFORCE_EXPIRY,
            data: { runDate: new Date().toISOString() },
        }
    );

    // Every day at midnight: detect churn
    await billingQueue.upsertJobScheduler(
        "detect-churn-schedule",
        { pattern: "0 0 * * *" },
        {
            name: JOB_NAMES.DETECT_CHURN,
            data: { runDate: new Date().toISOString() },
        }
    );

    // Every day at 1 AM: snapshot MRR for all creators
    await analyticsQueue.upsertJobScheduler(
        "mrr-snapshot-schedule",
        { pattern: "0 1 * * *" },
        {
            name: JOB_NAMES.SNAPSHOT_MRR,
            data: { creatorId: "all", date: new Date().toISOString() },
        }
    );

    console.info("📅 Repeatable job schedules registered");
}

// ─── Bootstrap ───────────────────────────────────────
async function main() {
    console.info("⚙️  PayGate Worker starting...");

    if (!process.env.REDIS_URL) {
        console.warn("⚠️  REDIS_URL not set — Worker is idle. Set env var to activate.");
        setInterval(() => { }, 60_000);
        return;
    }

    await registerSchedules();
    startJobWorkers();

    console.info("⚙️  PayGate Worker is running");
}

main().catch((err) => {
    console.error("Worker failed to start:", err);
    process.exit(1);
});

// Graceful shutdown
process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));
