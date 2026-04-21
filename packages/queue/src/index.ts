import { Queue } from "bullmq";

import { getRedisConnection } from "./connection.js";
import { QUEUE_NAMES, type JobPayloadMap, type JOB_NAMES } from "./jobs.js";

export { getRedisConnection, closeRedisConnection } from "./connection.js";
export {
    QUEUE_NAMES,
    JOB_NAMES,
    type JobPayloadMap,
    type AddMemberPayload,
    type RemoveMemberPayload,
    type SendDmPayload,
    type SendWelcomeDmPayload,
    type SendPaymentFailedDmPayload,
    type SendEmailPayload,
    type SnapshotMrrPayload,
    type RetryPaymentPayload,
    type DetectChurnPayload,
    type EnforceExpiryPayload,
} from "./jobs.js";

// ─── Queue Factory ───────────────────────────────────

export function createQueue(name: string): Queue {
    return new Queue(name, {
        connection: getRedisConnection() as any,
        defaultJobOptions: {
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 500 },
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        },
    });
}

// Lazy queue getters — only connect to Redis when actually used
let _membershipQueue: Queue | null = null;
let _notificationsQueue: Queue | null = null;
let _analyticsQueue: Queue | null = null;
let _billingQueue: Queue | null = null;

export function getMembershipQueue(): Queue {
    if (!_membershipQueue) _membershipQueue = createQueue(QUEUE_NAMES.MEMBERSHIP);
    return _membershipQueue;
}

export function getNotificationsQueue(): Queue {
    if (!_notificationsQueue) _notificationsQueue = createQueue(QUEUE_NAMES.NOTIFICATIONS);
    return _notificationsQueue;
}

export function getAnalyticsQueue(): Queue {
    if (!_analyticsQueue) _analyticsQueue = createQueue(QUEUE_NAMES.ANALYTICS);
    return _analyticsQueue;
}

export function getBillingQueue(): Queue {
    if (!_billingQueue) _billingQueue = createQueue(QUEUE_NAMES.BILLING);
    return _billingQueue;
}

// ─── Typed Job Publisher ─────────────────────────────

export async function publishJob<T extends keyof JobPayloadMap>(
    queueName: string,
    jobName: T,
    payload: JobPayloadMap[T],
    opts?: { delay?: number; priority?: number }
) {
    const queue = createQueue(queueName);
    return queue.add(jobName as string, payload, opts);
}
