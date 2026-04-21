import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const opdSessions = pgTable('opd_sessions', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').references(() => users.id),
  patientId: text('patient_id').references(() => users.id),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  status: text('status').default('active'),
  doctorNotes: text('doctor_notes'),
  sessionType: text('session_type').default('opd'),
});
