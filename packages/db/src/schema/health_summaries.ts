import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const healthSummaries = pgTable('health_summaries', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').references(() => users.id).unique(),
  summaryJson: jsonb('summary_json').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
});
