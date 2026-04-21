import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id),
  role: text('role').notNull().default('patient'), // 'patient' | 'doctor' | 'admin'
  fullName: text('full_name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  bloodGroup: text('blood_group'),
  isOnboarded: boolean('is_onboarded').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
