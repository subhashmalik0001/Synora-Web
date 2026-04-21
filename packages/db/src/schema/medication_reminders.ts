import { pgTable, text, timestamp, uuid, boolean, time } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { prescriptions } from "./prescriptions.js";

export const medicationReminders = pgTable('medication_reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  prescriptionId: text('prescription_id').references(() => prescriptions.id),
  medicineName: text('medicine_name').notNull(),
  dose: text('dose'),
  reminderTime: time('reminder_time').notNull(),
  daysOfWeek: text('days_of_week').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
