// ─── Queue Names ─────────────────────────────────────
export const QUEUE_NAMES = {
    MEMBERSHIP: "membership",
    NOTIFICATIONS: "notifications",
    ANALYTICS: "analytics",
    BILLING: "billing",
} as const;

// ─── Job Names ───────────────────────────────────────
export const JOB_NAMES = {
    // Membership jobs
    ADD_MEMBER: "add-member",
    REMOVE_MEMBER: "remove-member",

    // Notification jobs
    SEND_WELCOME_DM: "send-welcome-dm",
    SEND_PAYMENT_FAILED_DM: "send-payment-failed-dm",
    SEND_EXPIRY_WARNING_DM: "send-expiry-warning-dm",
    SEND_DM: "send-dm",
    SEND_EMAIL: "send-email",

    // Analytics jobs
    SNAPSHOT_MRR: "snapshot-mrr",
    TRACK_EVENT: "track-event",

    // Billing jobs
    RETRY_PAYMENT: "retry-payment",
    DETECT_CHURN: "detect-churn",
    ENFORCE_EXPIRY: "enforce-expiry",
} as const;

// ─── Job Payload Types ───────────────────────────────

export interface AddMemberPayload {
    membershipId: string;
    chatId: string;
    platform?: "telegram" | "discord" | "whatsapp";
    platformUserId?: string;
}

export interface RemoveMemberPayload {
    membershipId: string;
    chatId: string;
    reason: "payment_failed" | "subscription_cancelled" | "manual_removal";
    platform?: "telegram" | "discord" | "whatsapp";
    platformUserId?: string;
}

export interface SendDmPayload {
    telegramUserId: string;
    message: string;
    parseMode?: "Markdown" | "HTML";
}

export interface SendWelcomeDmPayload {
    platform: "telegram" | "discord" | "whatsapp";
    platformUserId: string;
    productName: string;
    communityInviteLink: string;
    creatorName: string;
}

export interface SendPaymentFailedDmPayload {
    platform: "telegram" | "discord" | "whatsapp";
    platformUserId: string;
    productName: string;
    paymentLink: string;
    retryCount: number;
    maxRetries: number;
}

export interface SendEmailPayload {
    to: string;
    subject: string;
    templateId: string;
    data: Record<string, unknown>;
}

export interface SnapshotMrrPayload {
    creatorId: string;
    date: string; // ISO date
}

export interface RetryPaymentPayload {
    subscriptionId: string;
    gateway: "razorpay" | "stripe";
    attempt: number;
}

export interface DetectChurnPayload {
    runDate: string; // ISO date
}

export interface EnforceExpiryPayload {
    runDate: string; // ISO date
}

export type JobPayloadMap = {
    [JOB_NAMES.ADD_MEMBER]: AddMemberPayload;
    [JOB_NAMES.REMOVE_MEMBER]: RemoveMemberPayload;
    [JOB_NAMES.SEND_DM]: SendDmPayload;
    [JOB_NAMES.SEND_WELCOME_DM]: SendWelcomeDmPayload;
    [JOB_NAMES.SEND_PAYMENT_FAILED_DM]: SendPaymentFailedDmPayload;
    [JOB_NAMES.SEND_EMAIL]: SendEmailPayload;
    [JOB_NAMES.SNAPSHOT_MRR]: SnapshotMrrPayload;
    [JOB_NAMES.RETRY_PAYMENT]: RetryPaymentPayload;
    [JOB_NAMES.DETECT_CHURN]: DetectChurnPayload;
    [JOB_NAMES.ENFORCE_EXPIRY]: EnforceExpiryPayload;
};
