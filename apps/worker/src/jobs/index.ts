import { Worker } from "bullmq";

import {
    QUEUE_NAMES,
    JOB_NAMES,
    getRedisConnection,
    getMembershipQueue,
    type RetryPaymentPayload,
    type DetectChurnPayload,
    type EnforceExpiryPayload,
    type SnapshotMrrPayload,
    type SendEmailPayload,
} from "@paygate/queue";
import { eq, and, lt, isNull } from "drizzle-orm";
import { db } from "@paygate/db";
import { memberships, communities } from "@paygate/db/schema";

import { processEmailJob } from "./email-handler.js";

export function startJobWorkers() {
    const connection = getRedisConnection();

    // ─── Billing queue worker ──────────────────────────
    const billingWorker = new Worker(
        QUEUE_NAMES.BILLING,
        async (job) => {
            const startTime = Date.now();
            console.info(`[billing] Processing job: ${job.name} (${job.id})`);

            switch (job.name) {
                case JOB_NAMES.RETRY_PAYMENT: {
                    const data = job.data as RetryPaymentPayload;
                    console.info(`Retrying payment for subscription ${data.subscriptionId}, attempt ${data.attempt}`);
                    // TODO: Call Razorpay/Stripe API to retry charge
                    break;
                }

                case JOB_NAMES.DETECT_CHURN: {
                    await handleDetectChurn();
                    break;
                }

                case JOB_NAMES.ENFORCE_EXPIRY: {
                    await handleEnforceExpiry();
                    break;
                }
            }

            console.info(`[billing] Job ${job.name} completed in ${Date.now() - startTime}ms`);
        },
        { connection, concurrency: 5 }
    );

    // ─── Analytics queue worker ────────────────────────
    const analyticsWorker = new Worker(
        QUEUE_NAMES.ANALYTICS,
        async (job) => {
            console.info(`[analytics] Processing job: ${job.name} (${job.id})`);

            switch (job.name) {
                case JOB_NAMES.SNAPSHOT_MRR: {
                    const data = job.data as SnapshotMrrPayload;
                    console.info(`Snapshotting MRR for creator ${data.creatorId} on ${data.date}`);
                    // TODO: Calculate MRR from active subscriptions
                    break;
                }
            }
        },
        { connection, concurrency: 2 }
    );

    // ─── Notifications queue worker ──────────────────────
    const notificationsWorker = new Worker(
        QUEUE_NAMES.NOTIFICATIONS,
        async (job) => {
            console.info(`[notifications] Processing job: ${job.name} (${job.id})`);

            switch (job.name) {
                case JOB_NAMES.SEND_EMAIL: {
                    const data = job.data as SendEmailPayload;
                    await processEmailJob(data);
                    break;
                }
                // SEND_DM and SEND_WELCOME_DM are handled by the telegram-bot consumers
            }
        },
        { connection, concurrency: 10 }
    );

    billingWorker.on("failed", (job, err) => {
        console.error(`[billing] Job ${job?.id} failed:`, err);
    });

    analyticsWorker.on("failed", (job, err) => {
        console.error(`[analytics] Job ${job?.id} failed:`, err);
    });

    notificationsWorker.on("failed", (job, err) => {
        console.error(`[notifications] Job ${job?.id} failed:`, err);
    });

    console.info("⚙️  Job workers started (billing, analytics, notifications)");
}

// ─── ENFORCE_EXPIRY ──────────────────────────────────
async function handleEnforceExpiry() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find active memberships past their period end (> 1 day overdue)
    const overdueActive = await db.query.memberships.findMany({
        where: and(
            eq(memberships.status, "active"),
            lt(memberships.currentPeriodEnd, oneDayAgo),
        ),
        with: { product: { with: { community: true } } },
    });

    for (const membership of overdueActive) {
        console.warn(`Reconciliation: Membership ${membership.id} is overdue. Marking as payment_failed.`);

        const gracePeriodEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        await db.update(memberships)
            .set({
                status: "payment_failed",
                paymentFailedAt: now,
                gracePeriodEndAt: gracePeriodEnd,
                updatedAt: now,
            })
            .where(eq(memberships.id, membership.id));

        // Schedule removal after grace period
        const chatId = membership.product?.community?.platformGroupId;
        if (chatId) {
            const queue = getMembershipQueue();
            await queue.add(JOB_NAMES.REMOVE_MEMBER, {
                membershipId: membership.id,
                chatId,
                reason: "payment_failed" as const,
            }, {
                delay: gracePeriodEnd.getTime() - now.getTime(),
                attempts: 3,
                jobId: `remove_${membership.id}_expiry`,
            });
        }
    }

    console.info(`Enforce expiry complete. Found ${overdueActive.length} overdue memberships.`);
}

// ─── DETECT_CHURN ────────────────────────────────────
async function handleDetectChurn() {
    const now = new Date();

    // Find payment_failed memberships past grace period that haven't been removed
    const overdueFailures = await db.query.memberships.findMany({
        where: and(
            eq(memberships.status, "payment_failed"),
            lt(memberships.gracePeriodEndAt, now),
            isNull(memberships.removedAt),
        ),
        with: { product: { with: { community: true } } },
    });

    for (const membership of overdueFailures) {
        console.warn(`Churn detection: Force-removing membership ${membership.id} (grace period expired)`);

        const chatId = membership.product?.community?.platformGroupId;
        if (chatId) {
            const queue = getMembershipQueue();
            await queue.add(JOB_NAMES.REMOVE_MEMBER, {
                membershipId: membership.id,
                chatId,
                reason: "payment_failed" as const,
            }, { attempts: 3 });
        } else {
            // No community — just update status
            await db.update(memberships)
                .set({ status: "removed", removedAt: now, updatedAt: now })
                .where(eq(memberships.id, membership.id));
        }
    }

    console.info(`Churn detection complete. Queued ${overdueFailures.length} removals.`);
}
