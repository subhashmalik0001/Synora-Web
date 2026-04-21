import { pgTable, text, timestamp, uuid, date, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { folders } from "./folders.js";

export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  folderId: text('folder_id').references(() => folders.id),
  fileUrl: text('file_url').notNull(),
  detectedSpecialization: text('detected_specialization'),
  clinicName: text('clinic_name'),
  prescriptionDate: date('prescription_date'),
  doctorName: text('doctor_name'),
  diagnosis: text('diagnosis'),
  summary: text('summary'),
  medicines: jsonb('medicines'),
  aiProcessed: boolean('ai_processed').default(false),
  aiConfidence: numeric('ai_confidence'),
  isLive: boolean('is_live').default(false),
  consultationId: text('consultation_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
