import { Queue } from "bullmq";
import { getRedisConnection, QUEUE_NAMES } from "@paygate/queue";

const connection = process.env.REDIS_URL ? getRedisConnection() : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notificationsQueue = connection ? new Queue(QUEUE_NAMES.NOTIFICATIONS, { connection: connection as any }) : null;
