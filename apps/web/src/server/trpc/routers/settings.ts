import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { profiles, doctorProfiles, users } from "@paygate/db";

import { router, protectedProcedure } from "../init";

export const settingsRouter = router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        console.log("DEBUG_SYNC_START: Fetching profile for user", ctx.user.id);
        
        try {
            // 1. Check User Context
            if (!ctx.user.id) {
                console.error("DEBUG_SYNC_ERROR: No user ID in context");
                throw new Error("Missing user context");
            }

            // 2. Fetch Profile
            let profile = null;
            try {
                profile = await ctx.db.query.profiles.findFirst({
                    where: eq(profiles.userId, ctx.user.id),
                });
                console.log("DEBUG_SYNC_SUCCESS: Profile found", !!profile);
            } catch (profileError: any) {
                console.error("DEBUG_SYNC_ERROR: Profiles table query failed", {
                    message: profileError.message,
                    code: profileError.code
                });
            }

            // 3. Fetch Doctor Profile
            let doctorProfile = null;
            try {
                doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
                    where: eq(doctorProfiles.userId, ctx.user.id),
                });
                console.log("DEBUG_SYNC_SUCCESS: Doctor profile found", !!doctorProfile);
            } catch (docError: any) {
                console.warn("DEBUG_SYNC_WARNING: Doctor profiles query failed", docError.message);
            }

            // 4. Fetch User Record
            let userRecord = null;
            try {
                userRecord = await ctx.db.query.users.findFirst({
                    where: eq(users.id, ctx.user.id),
                });
            } catch (uError: any) {
                console.warn("DEBUG_SYNC_WARNING: User table query failed", uError.message);
            }

            return {
                user: {
                    id: ctx.user.id,
                    name: profile?.fullName || userRecord?.name || ctx.user.name || "User", 
                    email: userRecord?.email || ctx.user.email,
                    phone: profile?.phone || userRecord?.phone,
                    role: profile?.role || userRecord?.role || ctx.user.role || "patient",
                },
                profile: profile ? {
                    id: profile.id,
                    role: profile.role,
                    fullName: profile.fullName,
                    phone: profile.phone,
                    bloodGroup: profile.bloodGroup,
                    isOnboarded: profile.isOnboarded,
                } : null,
                doctorProfile: doctorProfile ? {
                    id: doctorProfile.id,
                    specialization: doctorProfile.specialization,
                    registrationNumber: doctorProfile.registrationNumber,
                    clinicName: doctorProfile.clinicName,
                } : null,
            };
        } catch (error: any) {
            console.error("DEBUG_SYNC_CRITICAL_FAILURE:", error);
            
            // Ultimate fallback to session info
            return {
                user: {
                    id: ctx.user.id,
                    name: ctx.user.name || "User",
                    email: ctx.user.email,
                    role: ctx.user.role || "patient",
                },
                profile: null,
                doctorProfile: null,
            };
        }
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                fullName: z.string().min(1).optional(),
                phone: z.string().optional(),
                bloodGroup: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Update the clinical profile only (avoiding users table sync issues)
                const profileUpdate: Record<string, any> = { updatedAt: new Date() };
                if (input.fullName) profileUpdate.fullName = input.fullName;
                if (input.bloodGroup) profileUpdate.bloodGroup = input.bloodGroup;
                if (input.phone) profileUpdate.phone = input.phone;
                
                await ctx.db.update(profiles).set(profileUpdate).where(eq(profiles.userId, ctx.user.id));

                return { success: true };
            } catch (error: any) {
                console.error("UPDATE_PROFILE_ERROR:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to update profile: ${error.message}`,
                });
            }
        }),

    completeOnboarding: protectedProcedure
        .input(
            z.object({
                role: z.enum(["patient", "doctor"]),
                fullName: z.string().min(1),
                phone: z.string().optional(),
                bloodGroup: z.string().optional(),
                emergencyContactName: z.string().optional(),
                emergencyContactPhone: z.string().optional(),
                // Doctor specific
                specialization: z.string().optional(),
                experienceYears: z.number().optional(),
                registrationNumber: z.string().optional(),
                clinicName: z.string().optional(),
                clinicAddress: z.string().optional(),
                consultationFee: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            console.log("[ONBOARDING_INIT] 🏁 Starting onboarding for user:", ctx.user.id);
            console.log("[ONBOARDING_PAYLOAD] 📦 Data:", {
                role: input.role,
                fullName: input.fullName,
                idType: typeof ctx.user.id
            });

            try {
                // 1. Create/Update Profile
                console.log("[ONBOARDING_INSERT_START] 📝 Inserting into profiles table...");
                const [profile] = await ctx.db
                    .insert(profiles)
                    .values({
                        userId: ctx.user.id,
                        role: input.role,
                        fullName: input.fullName,
                        phone: input.phone || null,
                        bloodGroup: input.bloodGroup || null,
                        emergencyContactName: input.emergencyContactName || null,
                        emergencyContactPhone: input.emergencyContactPhone || null,
                        isOnboarded: true,
                    })
                    .onConflictDoUpdate({
                        target: profiles.userId,
                        set: {
                            role: input.role,
                            fullName: input.fullName,
                            phone: input.phone || null,
                            bloodGroup: input.bloodGroup || null,
                            emergencyContactName: input.emergencyContactName || null,
                            emergencyContactPhone: input.emergencyContactPhone || null,
                            isOnboarded: true,
                            updatedAt: new Date(),
                        }
                    })
                    .returning();
                console.log("[ONBOARDING_SUCCESS] ✅ Clinical profile created/updated");

                // 2. If doctor, create/update doctor_profile
                if (input.role === "doctor") {
                    console.log("[ONBOARDING_INSERT_START] 🏥 Inserting into doctor_profiles table...");
                    await ctx.db
                        .insert(doctorProfiles)
                        .values({
                            userId: ctx.user.id,
                            fullName: input.fullName,
                            specialization: input.specialization || "General",
                            experienceYears: input.experienceYears || 0,
                            registrationNumber: input.registrationNumber || "PENDING",
                            clinicName: input.clinicName || null,
                            clinicAddress: input.clinicAddress || null,
                            consultationFee: input.consultationFee || 0,
                        })
                        .onConflictDoUpdate({
                            target: doctorProfiles.userId,
                            set: {
                                fullName: input.fullName,
                                specialization: input.specialization || "General",
                                registrationNumber: input.registrationNumber || "PENDING",
                                updatedAt: new Date(),
                            }
                        });
                    console.log("[ONBOARDING_SUCCESS] 🩺 Doctor profile finalized");
                }

                // 3. Sync to Supabase Metadata for Middleware efficiency
                console.log("[ONBOARDING_SYNC] 🔄 Syncing status to Supabase metadata...");
                await (ctx as any).supabase.auth.updateUser({
                    data: { 
                        isOnboarded: true,
                        role: input.role 
                    }
                });
                console.log("[ONBOARDING_SUCCESS] ✨ Metadata synchronized");

                return { success: true, profile };
            } catch (error: any) {
                console.error("[ONBOARDING_CRITICAL_FAILURE] ❌ Postgres Error:", {
                    message: error.message,
                    code: error.code,
                    detail: error.detail,
                    hint: error.hint
                });
                
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Database synchronization failed: ${error.message}. Please ensure you 'npx drizzle-kit push' your database schema.`,
                });
            }
        }),
});
