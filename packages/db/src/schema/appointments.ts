import { pgTable, text, timestamp, uuid, date, boolean, unique } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.js";

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  appointmentDate: date('appointment_date').notNull(),
  timeSlot: text('time_slot').notNull(),
  appointmentType: text('appointment_type').default('online'), // 'online' | 'in_person'
  status: text('status').default('confirmed'), // 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    doctorDateTimeUnique: unique().on(table.doctorId, table.appointmentDate, table.timeSlot)
  }
});
