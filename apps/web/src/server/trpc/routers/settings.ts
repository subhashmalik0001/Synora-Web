import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { profiles, doctorProfiles, users } from "@paygate/db";

import { router, protectedProcedure } from "../init";

export const settingsRouter = router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        if ((ctx as any).isDemoMode) {
            return {
                user: {
                    id: "dummy-user-id",
                    name: "Demo Doctor",
                    email: "demo@synora.com",
                    role: "doctor",
                },
                profile: {
                    id: "dummy-profile-id",
                    role: "doctor",
                    fullName: "Demo Doctor",
                    phone: "+91 98765 43210",
                    bloodGroup: "O+",
                },
                doctorProfile: {
                    id: "dummy-doctor-id",
                    specialization: "Cardiology",
                    registrationNumber: "REG123456",
                    clinicName: "Synora Health Clinic",
                }
            };
        }
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


});
