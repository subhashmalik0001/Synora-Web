import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.js";

export const doctorPatients = pgTable('doctor_patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
});
