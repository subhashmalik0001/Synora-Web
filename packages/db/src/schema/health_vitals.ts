import { pgTable, text, timestamp, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const healthVitals = pgTable('health_vitals', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').references(() => users.id),
  recordedAt: timestamp('recorded_at').defaultNow(),
  weightKg: numeric('weight_kg', { precision: 5, scale: 2 }),
  heightCm: numeric('height_cm', { precision: 5, scale: 2 }),
  bloodPressureSystolic: integer('blood_pressure_systolic'),
  bloodPressureDiastolic: integer('blood_pressure_diastolic'),
  heartRate: integer('heart_rate'),
  bloodGlucose: numeric('blood_glucose', { precision: 6, scale: 2 }),
  temperatureC: numeric('temperature_c', { precision: 4, scale: 2 }),
  spo2: integer('spo2'),
  notes: text('notes'),
});
