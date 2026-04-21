import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { 
    profiles, 
    doctorProfiles, 
    appointments, 
    healthVitals, 
    folders, 
    labReports, 
    prescriptions 
} from "@paygate/db";

import { router, protectedProcedure } from "../init";

export const medicalRouter = router({
    // Vitals
    getVitals: protectedProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.db.query.healthVitals.findMany({
                    where: eq(healthVitals.userId, ctx.user.id),
                    limit: input.limit,
                    orderBy: [desc(healthVitals.recordedAt)],
                });
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: getVitals failed", error.message);
                return [];
            }
        }),


    logVitals: protectedProcedure
        .input(z.object({
            type: z.string(),
            value: z.string(),
            unit: z.string(),
            readingContext: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.insert(healthVitals).values({
                    userId: ctx.user.id,
                    ...input,
                }).returning();
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: logVitals failed", error.message);
                throw error;
            }
        }),


    // Appointments
    listAppointments: protectedProcedure.query(async ({ ctx }) => {
        try {
            // If doctor, show their appointments. If patient, show theirs.
            const profile = await ctx.db.query.profiles.findFirst({
                where: eq(profiles.userId, ctx.user.id),
            });

            if (profile?.role === 'doctor') {
                return await ctx.db.query.appointments.findMany({
                    where: eq(appointments.doctorId, ctx.user.id),
                    orderBy: [desc(appointments.scheduledAt)],
                });
            }

            return await ctx.db.query.appointments.findMany({
                where: eq(appointments.patientId, ctx.user.id),
                orderBy: [desc(appointments.scheduledAt)],
            });
        } catch (error: any) {
            console.error("DEBUG_MEDICAL_ERROR: listAppointments failed", error.message);
            return [];
        }
    }),

    // Records & Folders
    listFolders: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.query.folders.findMany({
                where: eq(folders.userId, ctx.user.id),
            });
        } catch (error: any) {
            console.error("DEBUG_MEDICAL_ERROR: listFolders failed", error.message);
            return [];
        }
    }),

    listRecords: protectedProcedure
        .input(z.object({ folderId: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            try {
                const where = input.folderId 
                    ? and(eq(labReports.userId, ctx.user.id), eq(labReports.folderId, input.folderId))
                    : eq(labReports.userId, ctx.user.id);
                
                return await ctx.db.query.labReports.findMany({
                    where,
                    orderBy: [desc(labReports.reportDate)],
                });
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: listRecords failed", error.message);
                return [];
            }
        }),


    // Doctor specific
    listPatients: protectedProcedure.query(async ({ ctx }) => {
        // This would normally involve an access_requests check or a relations table
        if (ctx.user.role !== "doctor") return [];
        
        const apps = await ctx.db.query.appointments.findMany({
            where: eq(appointments.doctorId, ctx.user.id),
        });
        
        const patientIds = [...new Set(apps.map(a => a.patientId))];
        
        if (patientIds.length === 0) return [];

        return ctx.db.query.profiles.findMany({
            where: (profiles, { inArray }) => inArray(profiles.userId, patientIds),
        });
    }),

    createPrescription: protectedProcedure
        .input(z.object({
            patientId: z.string(),
            diagnosis: z.string(),
            notes: z.string().optional(),
            medications: z.array(z.object({
                name: z.string(),
                dosage: z.string(),
                frequency: z.string(),
                duration: z.string(),
                instructions: z.string().optional(),
            })),
            followUpDate: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.user.role !== "doctor") {
                throw new Error("Only doctors can issue prescriptions");
            }

            return ctx.db.insert(prescriptions).values({
                doctorId: ctx.user.id,
                patientId: input.patientId,
                diagnosis: input.diagnosis,
                clinicalNotes: input.notes,
                medications: input.medications,
                status: "active",
                issuedAt: new Date(),
            }).returning();
        }),
});

