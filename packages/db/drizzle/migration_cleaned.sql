CREATE TABLE "access_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text,
	"doctor_id" text,
	"status" text DEFAULT 'pending',
	"message" text,
	"expires_at" timestamp,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"doctor_id" text,
	"patient_id" text,
	"appointment_date" date,
	"time_slot" text,
	"mode" text,
	"status" text DEFAULT 'booked',
	"reason" text,
	"meeting_link" text,
	"cancellation_reason" text,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "doctor_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"doctor_code" text,
	"full_name" text NOT NULL,
	"specialization" text,
	"qualifications" text,
	"experience_years" integer,
	"clinic_name" text,
	"clinic_address" text,
	"bio" text,
	"consultation_fee" integer,
	"languages_spoken" text[],
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"is_available_now" boolean DEFAULT false,
	"verification_status" text DEFAULT 'pending',
	"profile_photo" text,
	"registration_number" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "doctor_profiles_doctor_code_unique" UNIQUE("doctor_code")
);

CREATE TABLE "folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"folder_type" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "health_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text,
	"summary_json" jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	CONSTRAINT "health_summaries_patient_id_unique" UNIQUE("patient_id")
);

CREATE TABLE "health_vitals" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text,
	"recorded_at" timestamp DEFAULT now(),
	"weight_kg" numeric(5, 2),
	"height_cm" numeric(5, 2),
	"blood_pressure_systolic" integer,
	"blood_pressure_diastolic" integer,
	"heart_rate" integer,
	"blood_glucose" numeric(6, 2),
	"temperature_c" numeric(4, 2),
	"spo2" integer,
	"notes" text
);

CREATE TABLE "lab_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"file_url" text NOT NULL,
	"test_name" text,
	"lab_name" text,
	"report_date" date,
	"result_summary" text,
	"biomarkers" jsonb,
	"is_critical" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "medication_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"prescription_id" text,
	"medicine_name" text NOT NULL,
	"dose" text,
	"reminder_time" time NOT NULL,
	"days_of_week" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text,
	"message" text,
	"type" text DEFAULT 'general',
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "opd_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"doctor_id" text,
	"patient_id" text,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"status" text DEFAULT 'active',
	"doctor_notes" text,
	"session_type" text DEFAULT 'opd'
);

CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"file_url" text NOT NULL,
	"detected_specialization" text,
	"clinic_name" text,
	"prescription_date" date,
	"doctor_name" text,
	"diagnosis" text,
	"summary" text,
	"medicines" jsonb,
	"ai_processed" boolean DEFAULT false,
	"ai_confidence" numeric,
	"is_live" boolean DEFAULT false,
	"consultation_id" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'patient' NOT NULL,
	"full_name" text,
	"email" text,
	"avatar_url" text,
	"phone" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"blood_group" text,
	"is_onboarded" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"doctor_id" text,
	"patient_id" text,
	"appointment_id" text,
	"rating" integer,
	"comment" text,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"username" text,
	"role" text DEFAULT 'patient' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "health_summaries" ADD CONSTRAINT "health_summaries_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "health_vitals" ADD CONSTRAINT "health_vitals_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "opd_sessions" ADD CONSTRAINT "opd_sessions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "opd_sessions" ADD CONSTRAINT "opd_sessions_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;