import { pgTable, text, timestamp, uuid, date, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').references(() => users.id),
  patientId: text('patient_id').references(() => users.id),
  appointmentDate: date('appointment_date'),
  timeSlot: text('time_slot'),
  mode: text('mode'), // 'online' | 'offline'
  status: text('status').default('booked'),
  reason: text('reason'),
  meetingLink: text('meeting_link'),
  cancellationReason: text('cancellation_reason'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
