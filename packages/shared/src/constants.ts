// ─── Subscription Statuses ───────────────────────────
export const SUBSCRIPTION_STATUS = {
    ACTIVE: "active",
    PAUSED: "paused",
    CANCELLED: "cancelled",
    PAST_DUE: "past_due",
    EXPIRED: "expired",
    TRIALING: "trialing",
    PENDING: "pending",
} as const;

// ─── Payment Statuses ────────────────────────────────
export const PAYMENT_STATUS = {
    PENDING: "pending",
    CAPTURED: "captured",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded",
} as const;

// ─── Product Types ───────────────────────────────────
export const PRODUCT_TYPE = {
    MEMBERSHIP: "membership",
    COURSE: "course",
    DIGITAL_DOWNLOAD: "digital_download",
    ONE_TIME: "one_time",
} as const;

// ─── Billing Intervals ──────────────────────────────
export const BILLING_INTERVAL = {
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    YEARLY: "yearly",
    ONE_TIME: "one_time",
    LIFETIME: "lifetime",
} as const;

// ─── Platforms ───────────────────────────────────────
export const PLATFORM = {
    TELEGRAM: "telegram",
    DISCORD: "discord",
    WHATSAPP: "whatsapp",
} as const;

// ─── Payment Gateways ───────────────────────────────
export const GATEWAY = {
    RAZORPAY: "razorpay",
    STRIPE: "stripe",
    COINBASE: "coinbase",
    MANUAL: "manual",
} as const;

// ─── Currencies ─────────────────────────────────────
export const CURRENCY = {
    INR: "INR",
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
} as const;

// ─── App Config ─────────────────────────────────────
export const APP_CONFIG = {
    MAX_RETRY_ATTEMPTS: 3,
    TRIAL_DAYS_DEFAULT: 0,
    DEFAULT_COMMISSION_PERCENT: 10,
    PLATFORM_FEE_PERCENT: 5,
} as const;
