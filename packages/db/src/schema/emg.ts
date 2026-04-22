import { pgTable, text, timestamp, uuid, integer, numeric, bigserial, real } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const emgSessions = pgTable('emg_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').references(() => users.id),
  activityType: text('activity_type'),
  notes: text('notes'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

export const emgReadings = pgTable('emg_readings', {
  id: bigserial('id', { mode: "number" }).primaryKey(),
  sessionId: uuid('session_id').references(() => emgSessions.id),
  signalValue: real('signal_value'),
  normalizedValue: real('normalized_value'),
  fatigueIndex: real('fatigue_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
