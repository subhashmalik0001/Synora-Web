import { z } from "zod";
import { router, publicProcedure } from "../init";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const authRouter = router({
    signup: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string(),
            role: z.enum(["doctor", "patient"]),
        }))
        .mutation(async ({ input }) => {
            const admin = createAdminClient();

            // Create user with auto-confirm
            const { data, error } = await admin.auth.admin.createUser({
                email: input.email,
                password: input.password,
                email_confirm: true,
                user_metadata: {
                    full_name: input.name,
                    role: input.role,
                    isOnboarded: true
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            const userId = data.user.id;

            // Insert into users table with correct role
            const { error: userErr } = await admin.from('users').upsert({
                id: userId,
                name: input.name,
                email: input.email,
                role: input.role,
            }, { onConflict: 'id' });

            if (userErr) {
                console.error("SIGNUP_USER_TABLE_ERROR:", userErr);
            }

            // If doctor, also create a doctor_profiles entry
            if (input.role === 'doctor') {
                const { error: dpErr } = await admin.from('doctor_profiles').insert({
                    id: crypto.randomUUID(),
                    user_id: userId,
                    full_name: input.name,
                    specialization: 'General Physician',
                    qualifications: '',
                    experience_years: 0,
                    consultation_fee: 0,
                    avg_rating: '0',
                    languages_spoken: ['English'],
                    clinic_name: '',
                    clinic_address: '',
                    is_available_now: false,
                    registration_number: '',
                });

                if (dpErr) {
                    console.error("SIGNUP_DOCTOR_PROFILE_ERROR:", dpErr);
                }
            }

            return { success: true, user: data.user };
        }),
});
