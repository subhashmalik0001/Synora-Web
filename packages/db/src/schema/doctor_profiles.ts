import { pgTable, text, timestamp, uuid, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const doctorProfiles = pgTable('doctor_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  doctorCode: text('doctor_code').unique(),
  fullName: text('full_name').notNull(),
  specialization: text('specialization'),
  qualifications: text('qualifications'),
  experienceYears: integer('experience_years'),
  clinicName: text('clinic_name'),
  clinicAddress: text('clinic_address'),
  bio: text('bio'),
  consultationFee: integer('consultation_fee'),
  languagesSpoken: text('languages_spoken').array(),
  avgRating: numeric('avg_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  isAvailableNow: boolean('is_available_now').default(false),
  verificationStatus: text('verification_status').default('pending'),
  profilePhoto: text('profile_photo'),
  registrationNumber: text('registration_number'),
  createdAt: timestamp('created_at').defaultNow(),
});
