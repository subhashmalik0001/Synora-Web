import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { appointments } from './appointments.js';

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').references(() => users.id),
  patientId: text('patient_id').references(() => users.id),
  appointmentId: text('appointment_id').references(() => appointments.id),
  rating: integer('rating'),
  comment: text('comment'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
