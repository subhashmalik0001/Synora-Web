import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const accessRequests = pgTable('access_requests', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').references(() => users.id),
  doctorId: text('doctor_id').references(() => users.id),
  status: text('status').default('pending'),
  message: text('message'),
  expiresAt: timestamp('expires_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
